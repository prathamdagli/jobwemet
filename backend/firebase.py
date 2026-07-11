"""Thin wrapper around the Firebase Admin SDK.

FastAPI talks to Firebase directly through this module:
  * Authentication  -> verify the frontend's ID tokens
  * Firestore        -> read/write application data
  * Storage         -> read/write resume blobs

No Cloud Functions. The Admin SDK uses privileged credentials and
bypasses Firestore/Storage security rules, so the backend is responsible
for per-user isolation (always scope reads/writes by `uid`).

Initialisation is a singleton: ``initialize_firebase()`` runs at most once
per process and is driven by the service-account JSON resolved in
``config.CREDENTIALS_PATH``. There is no Application Default Credentials or
emulator fallback — a missing credential fails fast at startup.
"""
from __future__ import annotations

import os

import firebase_admin
from firebase_admin import auth, credentials, firestore, storage

from . import config

_initialized = False


def initialize_firebase() -> None:
    """Initialise the Admin SDK exactly once per process.

    The SDK is initialised from the service-account JSON at
    ``config.CREDENTIALS_PATH``. Returns early if the SDK is already up
    (either from a prior call or an external harness such as a test fixture),
    guaranteeing a single app instance.
    """
    global _initialized
    if _initialized:
        return
    # Respect an app already created by a test harness / import side-effect.
    if firebase_admin._apps:
        _initialized = True
        return

    cred_path = config.CREDENTIALS_PATH
    if not cred_path or not os.path.exists(cred_path):
        raise RuntimeError(
            "Firebase credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS "
            "to the service-account JSON path, or place the file at "
            f"{config.CREDENTIALS_PATH}. The backend cannot start without it."
        )

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(
        cred, {"storageBucket": config.STORAGE_BUCKET}
    )
    _initialized = True


# --- Clients (lazy singletons) --------------------------------------


def get_auth():
    """Return the Firebase Auth client (for ID-token verification)."""
    initialize_firebase()
    return auth


def get_db():
    """Return the Firestore client."""
    initialize_firebase()
    return firestore.client()


def get_bucket():
    """Return the default Cloud Storage bucket."""
    initialize_firebase()
    return storage.bucket()
