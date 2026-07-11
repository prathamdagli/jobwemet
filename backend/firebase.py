"""Thin wrapper around the Firebase Admin SDK.

FastAPI talks to Firebase directly through this module:
  * Authentication  -> verify the frontend's ID tokens
  * Firestore        -> read/write application data
  * Storage         -> read/write resume blobs

No Cloud Functions. The Admin SDK uses privileged credentials and
bypasses Firestore/Storage security rules, so the backend is responsible
for per-user isolation (always scope reads/writes by `uid`).
"""
from __future__ import annotations

import os

import firebase_admin
from firebase_admin import auth, credentials, firestore, storage

from . import config

_initialized = False


def initialize_firebase() -> None:
    """Initialise the Admin SDK exactly once per process."""
    global _initialized
    if _initialized:
        return

    init_options: dict = {"storageBucket": config.STORAGE_BUCKET}
    cred = None
    if config.CREDENTIALS_PATH and os.path.exists(config.CREDENTIALS_PATH):
        cred = credentials.Certificate(config.CREDENTIALS_PATH)

    if cred is not None:
        firebase_admin.initialize_app(cred, init_options)
    else:
        # Falls back to GOOGLE_APPLICATION_CREDENTIALS or the emulator.
        firebase_admin.initialize_app(options=init_options)

    _initialized = True


# --- Clients (lazy singletons) --------------------------------------


def get_auth():
    """Return the Firebase Auth client."""
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
