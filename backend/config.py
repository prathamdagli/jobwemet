"""Application configuration loaded from environment variables.

Values are read from the backend-local `backend/.env` file (see
`.env.example`). Because the app may be launched from the project root
(`start.bat`) or from inside `backend/`, the backend `.env` is loaded by
explicit path so configuration is reliable regardless of the working
directory. Shell environment variables (e.g. deployment platforms, the
Firebase CLI) still take precedence over `.env` values.

Secrets are never committed — `.env` is git-ignored.
"""
from __future__ import annotations

import os

from dotenv import load_dotenv

# Load the backend-local .env first (explicit path => works from any cwd),
# then also pick up an outer project-root .env if one exists. load_dotenv
# defaults to override=False, so real environment variables win over .env
# (correct for deployed environments that inject secrets via the shell).
_BACKEND_ENV = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_BACKEND_ENV):
    load_dotenv(_BACKEND_ENV, override=False)
load_dotenv(override=False)

# --- Firebase -------------------------------------------------------------
# The Firebase project id. Mirrors the frontend's VITE_FIREBASE_PROJECT_ID.
PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "jobwemet-bedd8")

# Path to a Firebase Admin service-account JSON file.
# Resolution order:
#   1. GOOGLE_APPLICATION_CREDENTIALS (explicit path you control).
#   2. backend/service-account.json (the file committed to .gitignore).
# The Admin SDK is initialised from this single file; there is no ADC /
# emulator fallback so a missing credential fails fast at startup.
_DEFAULT_SA_PATH = os.path.join(os.path.dirname(__file__), "service-account.json")
CREDENTIALS_PATH: str | None = (
    os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or _DEFAULT_SA_PATH or None
)

# Cloud Storage bucket, e.g. "jobwemet-bedd8.firebasestorage.app".
STORAGE_BUCKET: str = os.getenv(
    "FIREBASE_STORAGE_BUCKET", f"{PROJECT_ID}.firebasestorage.app"
)

# --- HTTP / CORS ---------------------------------------------------------
# Comma-separated list of allowed origins for the frontend. "*" allows all.
ALLOWED_ORIGINS: list[str] = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()
]

# --- AI provider ----------------------------------------------------------
# Active provider: "stub" | "openrouter". "stub" returns deterministic
# placeholder output (no network, no billing) when no key is configured.
# "openrouter" routes the four generative stages of the resume pipeline to
# OpenRouter's chat-completions API.
AI_PROVIDER: str = os.getenv("AI_PROVIDER", "stub")

# OpenRouter credentials/endpoint. The key is required whenever
# AI_PROVIDER=openrouter. OPENROUTER_MODEL defaults to the free
# `tencent/hy3:free` model and is configurable from .env (never
# hard-coded elsewhere). OPENROUTER_BASE_URL is also configurable so a
# gateway/proxy can be swapped in without code changes. OPENROUTER_REASONING
# (low|medium|high|...) optionally tunes reasoning effort for models that
# support it; it is sent only when set to a valid effort level and is
# gracefully omitted otherwise.
OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "tencent/hy3:free")
OPENROUTER_REASONING: str = os.getenv("OPENROUTER_REASONING", "low")
OPENROUTER_BASE_URL: str = os.getenv(
    "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
)

# Time in seconds before an AI provider request times out
AI_TIMEOUT_SECONDS: int = int(os.getenv("AI_TIMEOUT_SECONDS", "30"))


# When True, every request must carry a valid Firebase ID token.
# When False (local dev / emulator), requests without a token fall back
# to DEMO_UID so Swagger and quick tests work without authenticating.
REQUIRE_AUTH: bool = os.getenv("REQUIRE_AUTH", "false").lower() in ("1", "true", "yes")
DEMO_UID: str = os.getenv("DEMO_UID", "pElCtZIui4a6R9vGx5cUmUd6LFu1")

# --- Storage layout -------------------------------------------------------
# Resume bytes live at: users/{uid}/resumes/{resumeId}.{ext}
RESUME_STORAGE_PREFIX = "users"
RESUME_STORAGE_FOLDER = "resumes"

# --- Startup validation ---------------------------------------------------
# Providers that may be configured today. Another provider (e.g. a future
# OpenAI/Claude backend) can be added without touching the rest of the app —
# everything routes through ai.py.
ALLOWED_AI_PROVIDERS = {"stub", "openrouter"}


def validate_env() -> None:
    """Fail fast at startup with helpful messages on misconfiguration.

    Called once, before serving traffic, so bad config surfaces immediately
    in the launch logs instead of as a confusing runtime error later.
    """
    errors: list[str] = []

    if AI_PROVIDER not in ALLOWED_AI_PROVIDERS:
        errors.append(
            f"AI_PROVIDER must be one of {sorted(ALLOWED_AI_PROVIDERS)}, "
            f"got {AI_PROVIDER!r}."
        )

    if AI_PROVIDER == "openrouter" and not OPENROUTER_API_KEY:
        errors.append(
            "AI_PROVIDER=openrouter requires OPENROUTER_API_KEY to be set "
            "(otherwise no real generation can happen)."
        )

    if REQUIRE_AUTH and "*" in ALLOWED_ORIGINS:
        errors.append(
            "ALLOWED_ORIGINS cannot be '*' when REQUIRE_AUTH=true: a wildcard "
            "origin combined with credentials is rejected by browsers. Set "
            "ALLOWED_ORIGINS to your frontend's exact origin(s)."
        )

    if errors:
        raise RuntimeError(
            "Invalid backend configuration:\n  - " + "\n  - ".join(errors)
        )

# Trigger reload
