"""Application configuration loaded from environment variables.

All values are read from a local `.env` file (see `.env.example`).
Secrets are never committed — `.env` is git-ignored.
"""
from __future__ import annotations

import os

from dotenv import load_dotenv

# Load .env from the project root (or current working directory).
load_dotenv()

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
# Active provider: "stub" | "gemini" | "openai" (later). "stub" returns
# deterministic placeholder output when no real provider key is configured.
AI_PROVIDER: str = os.getenv("AI_PROVIDER", "stub")

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

# When True, every request must carry a valid Firebase ID token.
# When False (local dev / emulator), requests without a token fall back
# to DEMO_UID so Swagger and quick tests work without authenticating.
REQUIRE_AUTH: bool = os.getenv("REQUIRE_AUTH", "false").lower() in ("1", "true", "yes")
DEMO_UID: str = os.getenv("DEMO_UID", "demo-user")

# --- Storage layout -------------------------------------------------------
# Resume bytes live at: users/{uid}/resumes/{resumeId}.{ext}
RESUME_STORAGE_PREFIX = "users"
RESUME_STORAGE_FOLDER = "resumes"

# --- Startup validation ---------------------------------------------------
# Providers that may be configured today. OpenAI/Claude can be added later
# without touching the rest of the app (everything routes through ai.py).
ALLOWED_AI_PROVIDERS = {"stub", "gemini", "openai"}


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

    if AI_PROVIDER == "gemini" and not GEMINI_API_KEY:
        errors.append(
            "AI_PROVIDER=gemini requires GEMINI_API_KEY to be set "
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
