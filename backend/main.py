"""FastAPI application entry point for the JobWeMet backend.

Bootstraps FastAPI, configures CORS, loads environment variables,
initialises Firebase (Admin SDK) and registers the single API router.
Run with::

    uvicorn backend.main:app --reload
"""
from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from . import config
from .api import api_router
from .firebase import initialize_firebase

load_dotenv()

# Initialise Firebase before serving traffic so the Admin SDK clients
# (auth / firestore / storage) are ready.
initialize_firebase()

app = FastAPI(
    title="JobWeMet Backend",
    version="1.0.0",
    description=(
        "FastAPI backend for JobWeMet. Talks directly to Firebase "
        "(Authentication, Firestore, Storage). Replaces the previous "
        "Node.js Cloud Functions backend. All endpoints require a "
        "Firebase ID token as a Bearer header, except in local "
        "development mode where auth is disabled."
    ),
    contact={"name": "JobWeMet Engineering"},
)

# CORS — mirrors the ALLOWED_ORIGINS env (defaults to "*").
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", tags=["Meta"], summary="Health check")
def root() -> dict:
    return {"status": "ok", "service": "JobWeMet Backend", "version": "1.0.0"}


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
