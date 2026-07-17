"""FastAPI application entry point for the JobWeMet backend.

Bootstraps FastAPI, configures CORS, loads environment variables,
validates them, initialises Firebase (Admin SDK) and registers the
single API router plus the cross-cutting middleware and exception
handlers.

Run with::

    uvicorn backend.main:app --reload
"""
from __future__ import annotations

import contextvars
import json
import logging
import time
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

import config
import utils
from api import api_router
from database import initialize_firebase
from services import AIError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("jobwemet")

# Carries the per-request id so every log line — including those emitted
# inside endpoints and exception handlers — can include it.
request_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default="-"
)


class EnvelopeJSONResponse(JSONResponse):
    """Default response class: every successful JSON body is wrapped as
    ``{success: true, data: <body>}`` so the frontend can unwrap uniformly.

    Error responses are produced by the exception handlers using the plain
    ``JSONResponse`` (the error envelope), so they are never double-wrapped.
    If a body already carries a ``success`` key it is left untouched (defensive
    against accidental double-wrapping).
    """

    def render(self, content: Any) -> bytes:  # type: ignore[override]
        if isinstance(content, dict) and "success" in content:
            return super().render(content)
        return super().render({"success": True, "data": content})

# Human-readable error codes keyed by HTTP status, used by every error
# response so clients get a stable, machine-readable `code`.
_HTTP_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    422: "validation_error",
    429: "rate_limited",
    500: "internal_error",
    502: "bad_gateway",
    503: "service_unavailable",
    504: "gateway_timeout",
}


def _error_response(
    status_code: int,
    code: str,
    message: str,
    details: Optional[Any] = None,
    request_id: str = "-",
) -> JSONResponse:
    """Build a standard error envelope and stamp it with the request id."""
    body = {
        "success": False,
        "error": {"code": code, "message": message, "details": details},
    }
    response = JSONResponse(status_code=status_code, content=body)
    response.headers["X-Request-ID"] = request_id
    return response


def _safe_detail(detail: Any) -> str:
    """Render a FastAPI error detail as a plain string for the envelope."""
    if isinstance(detail, str):
        return detail
    try:
        return json.dumps(detail)
    except (TypeError, ValueError):
        return str(detail)


load_dotenv()

# Fail fast on misconfiguration before serving any traffic.
config.validate_env()

# Initialise Firebase before serving traffic so the Admin SDK clients
# (auth / firestore / storage) are ready.
initialize_firebase()

app = FastAPI(
    title="JobWeMet Backend",
    version="1.0.0",
    default_response_class=EnvelopeJSONResponse,
    description=(
        "FastAPI backend for JobWeMet. Talks directly to Firebase "
        "(Authentication, Firestore, Storage). Replaces the previous "
        "Node.js Cloud Functions backend. All endpoints require a "
        "Firebase ID token as a Bearer header, except in local "
        "development mode where auth is disabled."
    ),
    contact={"name": "JobWeMet Engineering"},
)

# CORS — mirrors ALLOWED_ORIGINS (comma-separated env). In production this
# must list the exact frontend origin(s); "*" is only acceptable for local
# development with auth disabled (enforced by config.validate_env).
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# Request lifecycle: request id, structured logging, response envelope.
# --------------------------------------------------------------------------
@app.middleware("http")
async def request_context(request: Request, call_next):
    """Assign a request id, log method/path/status/timing and the caller,
    and stamp the response with the id. Successful JSON bodies are already
    wrapped in the ``{success, data}`` envelope by ``EnvelopeJSONResponse``
    (the default response class); error bodies carry the error envelope from
    the exception handlers below.
    """
    rid = request.headers.get("X-Request-ID") or utils.generate_id("req_")
    token = request_id_ctx.set(rid)
    request.state.request_id = rid
    start = time.perf_counter()
    response = None
    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = (time.perf_counter() - start) * 1000
        uid = getattr(request.state, "uid", None)
        logger.error(
            "[req=%s] %s %s -> ERROR (%.1f ms) uid=%s",
            rid,
            request.method,
            request.url.path,
            elapsed_ms,
            uid or "-",
            exc_info=True,
        )
        request_id_ctx.reset(token)
        raise

    elapsed_ms = (time.perf_counter() - start) * 1000
    uid = getattr(request.state, "uid", None)
    logger.info(
        "[req=%s] %s %s -> %d (%.1f ms) uid=%s",
        rid,
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
        uid or "-",
    )
    request_id_ctx.reset(token)

    # Stamp every response with the id so clients can correlate logs.
    response.headers["X-Request-ID"] = rid

    # Successful bodies are already wrapped in the {success, data} envelope by
    # EnvelopeJSONResponse (the app's default response class); error bodies are
    # produced as envelopes by the exception handlers. Nothing to do here but
    # keep the request id on the response.
    return response


# --------------------------------------------------------------------------
# Global exception handlers — every error shares one JSON shape.
# --------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    code = _HTTP_CODES.get(exc.status_code, "http_error")
    return _error_response(
        exc.status_code,
        code,
        _safe_detail(exc.detail),
        request_id=getattr(request.state, "request_id", "-"),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    details = [
        {
            "loc": list(err.get("loc", [])),
            "msg": err.get("msg"),
            "type": err.get("type"),
        }
        for err in exc.errors()
    ]
    return _error_response(
        422,
        "validation_error",
        "Request validation failed.",
        details,
        request_id=getattr(request.state, "request_id", "-"),
    )


@app.exception_handler(AIError)
async def ai_error_handler(request: Request, exc: AIError) -> JSONResponse:
    logger.warning(
        "AI provider error [req=%s] %s %s: %s",
        getattr(request.state, "request_id", "-"),
        request.method,
        request.url.path,
        exc.code,
    )
    return _error_response(
        exc.status_code,
        exc.code,
        str(exc),
        request_id=getattr(request.state, "request_id", "-"),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.error(
        "Unhandled error [req=%s] %s %s: %s",
        getattr(request.state, "request_id", "-"),
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return _error_response(
        500,
        "internal_error",
        "An unexpected error occurred. Please try again later.",
        request_id=getattr(request.state, "request_id", "-"),
    )


app.include_router(api_router)


@app.get("/", tags=["Meta"], summary="Health check")
def root() -> JSONResponse:
    # Plain response (bypasses the success envelope) for uptime probes.
    return JSONResponse(
        {"status": "ok", "service": "JobWeMet Backend", "version": "1.0.0"}
    )


def _custom_openapi() -> dict:
    """Augment the generated schema with a Bearer security scheme."""
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema["components"] = schema.get("components", {})
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT (Firebase ID token)",
        }
    }
    for path in schema.get("paths", {}).values():
        for operation in path.values():
            if isinstance(operation, dict):
                operation.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = _custom_openapi
