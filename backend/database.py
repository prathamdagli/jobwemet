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

from google.cloud import firestore

from . import models
from .firebase import get_db

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


# --- Resumes -------------------------------------------------------------


def list_resumes(uid: str) -> list[models.Resume]:
    query = (
        get_db()
        .collection(COL_RESUMES)
        .where("userId", "==", uid)
        .order_by("uploadedAt", direction=firestore.Query.DESCENDING)
    )
    out: list[models.Resume] = []
    for snap in query.stream():
        out.append(models.Resume(id=snap.id, **snap.to_dict()))
    return out


def get_resume(uid: str, resume_id: str) -> models.Resume | None:
    snap = get_db().collection(COL_RESUMES).document(resume_id).get()
    if not snap.exists:
        return None
    doc = snap.to_dict()
    if doc.get("userId") != uid:
        return None
    return models.Resume(id=snap.id, **doc)


def save_resume(resume: models.Resume) -> models.Resume:
    data = resume.model_dump(exclude_none=True, by_alias=True)
    data["updatedAt"] = firestore.SERVER_TIMESTAMP
    get_db().collection(COL_RESUMES).document(resume.id).set(data, merge=True)
    return resume


def delete_resume(uid: str, resume_id: str) -> None:
    existing = get_resume(uid, resume_id)
    if existing is None:
        raise FileNotFoundError("Resume not found.")
    get_db().collection(COL_RESUMES).document(resume_id).update(
        {"status": "deleted", "updatedAt": firestore.SERVER_TIMESTAMP}
    )


def update_profile(
    uid: str,
    display_name: str | None = None,
    target_career: str | None = None,
    location: str | None = None,
    phone: str | None = None,
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
    ):
        if val is not None:
            changed[key] = val
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
