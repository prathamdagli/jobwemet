"""Firestore access helpers.

Every helper is scoped by `uid` so the backend never exposes one
user's data to another. Document ids follow the existing contract:

  * ``users/{uid}``
  * ``resumes/{resumeId}``            (many per user)
  * ``resumeProcessing/{resumeId}``   (one per resume)
  * ``skillAnalysis/{resumeId}``      (one per resume)
  * ``careerMatches/{resumeId}``
  * ``skillGap/{resumeId}``
  * ``roadmaps/{resumeId}``
  * ``courseRecommendations/{resumeId}``
  * ``dashboardSummary/{resumeId}``
"""
from __future__ import annotations

import datetime as _dt
import os

import firebase_admin
from firebase_admin import auth, credentials, firestore, storage
from google.cloud.firestore import FieldFilter

from . import config, models, utils

# --------------------------------------------------------------------------
# Firebase Admin SDK (initialisation + client singletons).
#
# FastAPI talks to Firebase directly through this module:
#   * Authentication  -> verify the frontend's ID tokens
#   * Firestore        -> read/write application data
#   * Storage         -> read/write resume blobs
#
# No Cloud Functions. The Admin SDK uses privileged credentials and
# bypasses Firestore/Storage security rules, so the backend is responsible
# for per-user isolation (always scope reads/writes by `uid`).
#
# Initialisation is a singleton: ``initialize_firebase()`` runs at most once
# per process and is driven by the service-account JSON resolved in
# ``config.CREDENTIALS_PATH``. There is no Application Default Credentials or
# emulator fallback — a missing credential fails fast at startup.
# --------------------------------------------------------------------------
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

# Collection names (kept identical to the existing data contract).
COL_USERS = "users"
COL_RESUMES = "resumes"
COL_PROCESSING = "resumeProcessing"
COL_ANALYSIS = "skillAnalysis"
COL_CAREERS = "careerMatches"
COL_GAP = "skillGap"
COL_ROADMAP = "roadmaps"
COL_COURSES = "courseRecommendations"
COL_DASHBOARD = "dashboardSummary"
COL_SETTINGS = "settings"
COL_ACTIVITY = "activity"


def _ts(value) -> str | None:
    """Convert a Firestore Timestamp (or None) to an ISO string."""
    if value is None:
        return None
    if isinstance(value, _dt.datetime):
        return value.isoformat()
    return str(value)


# --- User ----------------------------------------------------------------


def get_user(uid: str) -> models.User | None:
    snap = get_db().collection(COL_USERS).document(uid).get()
    return models.User(**snap.to_dict()) if snap.exists else None


def save_user(user: models.User) -> models.User:
    data = user.model_dump(exclude_none=True)
    data["updatedAt"] = firestore.SERVER_TIMESTAMP
    get_db().collection(COL_USERS).document(user.uid).set(data, merge=True)
    return user


def ensure_user(
    uid: str,
    email: str | None = None,
    display_name: str | None = None,
    photo_url: str | None = None,
) -> None:
    """Idempotently create the ``users/{uid}`` doc for a brand-new user.

    The frontend no longer writes Firestore directly (and the old
    sign-up Cloud Function is gone), so the first authenticated
    request bootstraps the profile from the token claims. Safe to call
    on every request — it only writes when the doc is absent.
    """
    if get_user(uid) is not None:
        return
    save_user(
        models.User(
            uid=uid,
            displayName=display_name or email or "New User",
            email=email or "",
            photoURL=photo_url,
            provider="password",
        )
    )


# --- Resumes -------------------------------------------------------------


def list_resumes(uid: str) -> list[models.Resume]:
    query = (
        get_db()
        .collection(COL_RESUMES)
        .where(filter=FieldFilter("userId", "==", uid))
        .order_by("uploadedAt", direction=firestore.Query.DESCENDING)
    )
    out: list[models.Resume] = []
    for snap in query.stream():
        doc = snap.to_dict()
        doc.pop("id", None)
        out.append(models.Resume(id=snap.id, **doc))
    return out


def get_resume(uid: str, resume_id: str) -> models.Resume | None:
    snap = get_db().collection(COL_RESUMES).document(resume_id).get()
    if not snap.exists:
        return None
    doc = snap.to_dict()
    if doc.get("userId") != uid:
        return None
    doc.pop("id", None)
    return models.Resume(id=snap.id, **doc)


def save_resume(resume: models.Resume) -> models.Resume:
    data = resume.model_dump(exclude_none=True, by_alias=True)
    data["updatedAt"] = firestore.SERVER_TIMESTAMP
    get_db().collection(COL_RESUMES).document(resume.id).set(data, merge=True)
    return resume


def delete_resume_tree(uid: str, resume_id: str) -> dict:
    """Hard-delete a resume and every Firestore document tied to it.

    Deletes the resume metadata, its processing/analysis/matches/gap/roadmap/
    courses/dashboard documents, and any activity records linked to the
    resume. Storage blob deletion is handled by the caller (resume.py) to
    avoid an import cycle. Uses a single batched write.

    Returns a count of deleted activity records.
    """
    existing = get_resume(uid, resume_id)
    if existing is None:
        raise FileNotFoundError("Resume not found.")

    db = get_db()
    batch = db.batch()
    for col in (
        COL_RESUMES,
        COL_PROCESSING,
        COL_ANALYSIS,
        COL_CAREERS,
        COL_GAP,
        COL_ROADMAP,
        COL_COURSES,
        COL_DASHBOARD,
    ):
        batch.delete(db.collection(col).document(resume_id))

    # Activity linked to this resume (subcollection under the user).
    activity_deleted = 0
    acts = (
        db.collection(COL_USERS)
        .document(uid)
        .collection(COL_ACTIVITY)
        .where(filter=FieldFilter("resumeId", "==", resume_id))
        .stream()
    )
    for snap in acts:
        batch.delete(snap.reference)
        activity_deleted += 1

    # Detach a dangling pointer if this was the user's current resume.
    user_snap = db.collection(COL_USERS).document(uid).get()
    if user_snap.exists and user_snap.to_dict().get("currentResumeId") == resume_id:
        batch.update(
            user_snap.reference,
            {"currentResumeId": None, "updatedAt": firestore.SERVER_TIMESTAMP},
        )

    batch.commit()
    return {"deletedResume": resume_id, "deletedActivity": activity_deleted}


def update_profile(
    uid: str,
    display_name: str | None = None,
    target_career: str | None = None,
    location: str | None = None,
    phone: str | None = None,
    bio: str | None = None,
    education: str | None = None,
    linkedin: str | None = None,
    github: str | None = None,
    portfolio: str | None = None,
    profile_image: str | None = None,
) -> models.User:
    existing = get_user(uid)
    if existing is None:
        raise FileNotFoundError("User not found.")
    changed: dict = {}
    for key, val in (
        ("displayName", display_name),
        ("targetCareer", target_career),
        ("location", location),
        ("phone", phone),
        ("bio", bio),
        ("education", education),
        ("linkedin", linkedin),
        ("github", github),
        ("portfolio", portfolio),
        ("profileImage", profile_image),
    ):
        if val is not None:
            changed[key] = val
    if not changed:
        return existing
    changed["updatedAt"] = firestore.SERVER_TIMESTAMP
    get_db().collection(COL_USERS).document(uid).update(changed)
    return get_user(uid)  # type: ignore[return-value]


# --- Resume processing -----------------------------------------------------


def get_processing(resume_id: str) -> models.Processing | None:
    snap = get_db().collection(COL_PROCESSING).document(resume_id).get()
    return models.Processing(**snap.to_dict()) if snap.exists else None


def save_processing(proc: models.Processing) -> models.Processing:
    get_db().collection(COL_PROCESSING).document(proc.resumeId).set(
        proc.model_dump(exclude_none=True), merge=True
    )
    return proc


# --- Resume-derived slices (keyed by resumeId) -------------------------


def _get_one(collection: str, resume_id: str, model):
    snap = get_db().collection(collection).document(resume_id).get()
    return model(**snap.to_dict()) if snap.exists else None


def _save_one(collection: str, resume_id: str, payload: dict) -> None:
    get_db().collection(collection).document(resume_id).set(payload, merge=True)


def get_skill_analysis(resume_id: str) -> models.SkillAnalysis | None:
    return _get_one(COL_ANALYSIS, resume_id, models.SkillAnalysis)


def save_skill_analysis(resume_id: str, analysis: models.SkillAnalysis) -> None:
    _save_one(COL_ANALYSIS, resume_id, analysis.model_dump(exclude_none=True))


def get_career_matches(resume_id: str) -> models.CareerMatches | None:
    return _get_one(COL_CAREERS, resume_id, models.CareerMatches)


def save_career_matches(resume_id: str, matches: models.CareerMatches) -> None:
    _save_one(COL_CAREERS, resume_id, matches.model_dump(exclude_none=True))


def get_skill_gap(resume_id: str) -> models.SkillGap | None:
    return _get_one(COL_GAP, resume_id, models.SkillGap)


def save_skill_gap(resume_id: str, gap: models.SkillGap) -> None:
    _save_one(COL_GAP, resume_id, gap.model_dump(exclude_none=True))


def get_roadmap(resume_id: str) -> models.Roadmap | None:
    return _get_one(COL_ROADMAP, resume_id, models.Roadmap)


def save_roadmap(resume_id: str, roadmap: models.Roadmap) -> None:
    _save_one(COL_ROADMAP, resume_id, roadmap.model_dump(exclude_none=True))


def get_courses(resume_id: str) -> models.CourseRecommendations | None:
    return _get_one(COL_COURSES, resume_id, models.CourseRecommendations)


def save_courses(resume_id: str, courses: models.CourseRecommendations) -> None:
    _save_one(COL_COURSES, resume_id, courses.model_dump(exclude_none=True))


def get_dashboard(resume_id: str) -> models.DashboardSummary | None:
    return _get_one(COL_DASHBOARD, resume_id, models.DashboardSummary)


def save_dashboard(resume_id: str, dashboard: models.DashboardSummary) -> None:
    _save_one(COL_DASHBOARD, resume_id, dashboard.model_dump(exclude_none=True))


# --- Settings -------------------------------------------------------------


def get_settings(uid: str) -> models.Settings:
    snap = get_db().collection(COL_SETTINGS).document(uid).get()
    return models.Settings(**snap.to_dict()) if snap.exists else models.Settings()


def save_settings(uid: str, settings: models.Settings) -> models.Settings:
    get_db().collection(COL_SETTINGS).document(uid).set(
        settings.model_dump(exclude_none=True), merge=True
    )
    return settings


# --- Activity -------------------------------------------------------------


def add_activity(
    uid: str, item: models.ActivityItem
) -> models.ActivityItem:
    """Persist one activity record under ``users/{uid}/activity``."""
    item.id = item.id or utils.generate_id("act_")
    item.userId = uid
    item.timestamp = item.timestamp or utils.now()
    ref = (
        get_db()
        .collection(COL_USERS)
        .document(uid)
        .collection(COL_ACTIVITY)
        .document(item.id)
    )
    ref.set(item.model_dump(exclude_none=True))
    return item


def list_activity(uid: str, limit: int = 10, start_after_id: str | None = None) -> list[models.ActivityItem]:
    """Most-recent activity records for a user (newest first)."""
    db = get_db()
    query = (
        db
        .collection(COL_USERS)
        .document(uid)
        .collection(COL_ACTIVITY)
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
    )
    if start_after_id:
        doc = db.collection(COL_USERS).document(uid).collection(COL_ACTIVITY).document(start_after_id).get()
        if doc.exists:
            query = query.start_after(doc)
            
    snaps = query.limit(limit).stream()
    return [models.ActivityItem(**s.to_dict()) for s in snaps]
