"""All REST API endpoints for the JobWeMet backend.

This module is intentionally the single home for every route. The
frontend talks to these endpoints (and reads Firestore directly); nothing
here calls Firebase Cloud Functions. Authentication is performed by
verifying a Firebase ID token passed as a Bearer header.

Every endpoint is documented for Swagger with a summary, description,
request/response models and status codes.
"""
from __future__ import annotations

import logging
import re
from typing import Optional

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, Request, UploadFile

from . import config, database, models, utils
from .database import get_auth
from .services import (
    _flatten_skills,
    analyze_resume as run_analyze,
    build_dashboard,
    build_dashboard_detail,
    compute_skill_gap,
    create_resume_record,
    delete_storage_object,
    generate_roadmap,
    mark_processing,
    match_careers,
    read_resume_text,
    recommend_courses,
    update_dashboard_progress,
    upload_bytes,
    validate_resume_file,
)

logger = logging.getLogger("jobwemet.api")

api_router = APIRouter()

# Activity titles keyed by type (used for the stored activity feed).
_ACTIVITY_TITLES = {
    "resume_uploaded": "Resume Uploaded",
    "resume_analysed": "Resume Analysed",
    "roadmap_generated": "Roadmap Generated",
    "courses_generated": "Courses Generated",
    "profile_updated": "Profile Updated",
    "settings_changed": "Settings Changed",
}


# --------------------------------------------------------------------------
# Authentication dependency
# --------------------------------------------------------------------------
def _extract_bearer(authorization: str) -> Optional[str]:
    """Return the token from an ``Authorization: Bearer <token>`` header."""
    if not authorization:
        return None
    parts = authorization.split(None, 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None


def get_current_user(
    request: Request, authorization: str = Header(default="")
) -> models.FirebaseUser:
    """Resolve the calling user from a Firebase ID token.

    In production ``REQUIRE_AUTH`` is True and a valid Bearer token is
    mandatory. During local development (emulator / Swagger) auth is
    optional and an artificial demo user is substituted so the API can
    be exercised without minting tokens. The resolved ``uid`` is stashed
    on ``request.state`` so the request-id/logging middleware can include
    it in the access log.
    """
    token = _extract_bearer(authorization)
    if token:
        try:
            decoded = get_auth().verify_id_token(token)
            database.ensure_user(
                decoded["uid"],
                decoded.get("email"),
                decoded.get("name"),
                decoded.get("picture"),
            )
            user = models.FirebaseUser(
                uid=decoded["uid"],
                email=decoded.get("email"),
                name=decoded.get("name"),
            )
            request.state.uid = user.uid
            return user
        except Exception:  # noqa: BLE001 - surface a clean 401 on bad tokens
            if config.REQUIRE_AUTH:
                raise HTTPException(
                    status_code=401, detail="Invalid or expired Firebase ID token."
                )
    if config.REQUIRE_AUTH:
        raise HTTPException(
            status_code=401, detail="Authorization Bearer token is required."
        )
    user = models.FirebaseUser(uid=config.DEMO_UID, email="dev@example.com", name="Dev User")
    request.state.uid = user.uid
    return user


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _require_user(uid: str) -> models.User:
    user = database.get_user(uid)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


def _require_resume(user: models.FirebaseUser, resume_id: str) -> models.Resume:
    resume = database.get_resume(user.uid, resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return resume


def _latest_resume_id(user: models.FirebaseUser) -> Optional[str]:
    """Pick the active resume: explicit currentResumeId, else newest uploaded."""
    user_doc = database.get_user(user.uid)
    if user_doc and user_doc.currentResumeId:
        return user_doc.currentResumeId
    resumes = database.list_resumes(user.uid)
    return resumes[0].id if resumes else None


def _record_activity(
    uid: str, resume_id: Optional[str], activity_type: str, description: str = ""
) -> None:
    database.add_activity(
        uid,
        models.ActivityItem(
            userId=uid,
            resumeId=resume_id,
            activityType=activity_type,  # type: ignore[arg-type]
            title=_ACTIVITY_TITLES.get(activity_type, activity_type),
            description=description,
        ),
    )


_PHONE_RE = re.compile(r"^[\d\s+()-]{0,30}$")


def _validate_profile(body: models.UpdateProfileRequest) -> None:
    """Light validation of editable profile fields. Raises 400 on bad input."""
    if body.displayName is not None:
        name = body.displayName.strip()
        if not name:
            raise HTTPException(status_code=400, detail="displayName cannot be empty.")
        if len(name) > 100:
            raise HTTPException(status_code=400, detail="displayName is too long.")
    if body.phone is not None and not _PHONE_RE.match(body.phone):
        raise HTTPException(status_code=400, detail="Invalid phone number format.")
    if body.targetCareer is not None and len(body.targetCareer) > 100:
        raise HTTPException(status_code=400, detail="targetCareer is too long.")
    if body.location is not None and len(body.location) > 120:
        raise HTTPException(status_code=400, detail="location is too long.")
    if body.bio is not None and len(body.bio) > 2000:
        raise HTTPException(status_code=400, detail="bio is too long (max 2000).")
    if body.education is not None and len(body.education) > 200:
        raise HTTPException(status_code=400, detail="education is too long.")
    for field in ("linkedin", "github", "portfolio", "profileImage"):
        val = getattr(body, field)
        if val is not None and len(val) > 255:
            raise HTTPException(status_code=400, detail=f"{field} is too long.")


# --------------------------------------------------------------------------
# Resume upload / processing
# --------------------------------------------------------------------------
@api_router.post(
    "/upload-resume",
    response_model=models.ResumeUploadResponse,
    status_code=201,
    summary="Upload and register a resume",
    description=(
        "Accepts a multipart PDF or DOCX resume, uploads the bytes to "
        "Firebase Storage at ``users/{uid}/resumes/{resumeId}.{ext}``, "
        "creates the ``resumes`` document (status ``uploaded``), a "
        "``resumeProcessing`` document (with ``userId``) and records a "
        "'Resume Uploaded' activity."
    ),
    responses={
        400: {"description": "Unsupported file type or empty/invalid upload."},
        401: {"description": "Missing or invalid Firebase ID token."},
    },
    tags=["Resume"],
)
def upload_resume(
    file: UploadFile = File(..., description="PDF or DOCX resume file."),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.ResumeUploadResponse:
    data = file.file.read()
    try:
        ext = validate_resume_file(file.filename or "resume", file.content_type, len(data))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    resume_id = utils.generate_id("res_")
    storage_path = upload_bytes(user.uid, resume_id, data, ext)
    record = create_resume_record(
        user.uid,
        resume_id,
        file.filename or "resume",
        file.content_type or "",
        len(data),
        storage_path,
    )
    mark_processing(user.uid, resume_id, status="queued")
    _record_activity(user.uid, resume_id, "resume_uploaded", record.fileName)
    logger.info("Resume uploaded: uid=%s resumeId=%s", user.uid, resume_id)
    return models.ResumeUploadResponse(
        resumeId=resume_id,
        fileName=record.fileName,
        storagePath=storage_path,
        status=record.status,
    )


@api_router.post(
    "/process-resume",
    response_model=models.ActionResponse,
    summary="Extract text from an uploaded resume",
    description=(
        "Downloads the stored resume bytes, extracts plain text "
        "(PDF via PyMuPDF, DOCX via python-docx) and advances the "
        "``resumeProcessing`` document. This is the first step before "
        "analysis and roadmap generation."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Resume not found for the user."},
    },
    tags=["Resume"],
)
def process_resume(
    body: models.ProcessResumeRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.ActionResponse:
    _require_resume(user, body.resumeId)
    try:
        text = read_resume_text(user.uid, body.resumeId)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")
    mark_processing(user.uid, body.resumeId, status="processing", progress=50)
    return models.ActionResponse(
        status="ok",
        message=f"Extracted {len(text)} characters from resume.",
        resumeId=body.resumeId,
        data={"characters": len(text)},
    )


# --------------------------------------------------------------------------
# Analysis pipeline
# --------------------------------------------------------------------------
@api_router.post(
    "/analyze-resume",
    response_model=models.SkillAnalysis,
    summary="Analyze a resume into skills / matches / gaps",
    description=(
        "Runs the analysis pipeline: extracts skills/experience/education, "
        "matches careers, computes the skill gap and builds the dashboard "
        "summary. Persists all of those documents and returns the skill "
        "analysis."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Resume not found for the user."},
    },
    tags=["Analysis"],
)
def analyze_resume(
    body: models.AnalyzeResumeRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.SkillAnalysis:
    resume_id = _require_resume(user, body.resumeId).id
    target = _target_career_for(user)
    try:
        text = read_resume_text(user.uid, resume_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")

    analysis = run_analyze(resume_id, text, target)
    skills = [s for grp in (analysis.technicalSkills or []) for s in grp.skills]
    matches = match_careers(resume_id, skills, target)
    top = matches.careers[0] if matches.careers else None

    # If the user hasn't set a target, fall back to the top AI-recommended career
    effective_target = target if target else (top.careerName if top else "")

    gap = compute_skill_gap(resume_id, skills, effective_target)
    build_dashboard(
        resume_id,
        skills_count=len(skills),
        missing_count=len(gap.missingSkills),
        top_career=top.careerName if top else "",
        top_confidence=top.confidence if top else 0.0,
        roadmap_pct=0,
        current_phase="",
        recommended_course="",
    )
    mark_processing(user.uid, resume_id, status="completed", progress=100)
    _record_activity(user.uid, resume_id, "resume_analysed")
    logger.info("Resume analysed: uid=%s resumeId=%s", user.uid, resume_id)
    return analysis


@api_router.post(
    "/regenerate-analysis",
    response_model=models.SkillAnalysis,
    summary="Re-run the resume analysis",
    description=(
        "Re-runs the full analysis pipeline for an already-processed "
        "resume (e.g. after the target career changed). Idempotent with "
        "respect to the stored documents."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Resume not found for the user."},
    },
    tags=["Analysis"],
)
def regenerate_analysis(
    body: models.RegenerateAnalysisRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.SkillAnalysis:
    resume_id = _require_resume(user, body.resumeId).id
    target = _target_career_for(user)
    try:
        text = read_resume_text(user.uid, resume_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")
    analysis = run_analyze(resume_id, text, target)
    skills = [s for grp in (analysis.technicalSkills or []) for s in grp.skills]
    matches = match_careers(resume_id, skills, target)
    top = matches.careers[0] if matches.careers else None

    # If the user hasn't set a target, fall back to the top AI-recommended career
    effective_target = target if target else (top.careerName if top else "")

    gap = compute_skill_gap(resume_id, skills, effective_target)
    build_dashboard(
        resume_id,
        skills_count=len(skills),
        missing_count=len(gap.missingSkills),
        top_career=top.careerName if top else "",
        top_confidence=top.confidence if top else 0.0,
        roadmap_pct=0,
        current_phase="",
        recommended_course="",
    )
    _record_activity(user.uid, resume_id, "resume_analysed")
    return analysis


# --------------------------------------------------------------------------
# Roadmap
# --------------------------------------------------------------------------
@api_router.post(
    "/generate-roadmap",
    response_model=models.Roadmap,
    summary="Generate a learning roadmap",
    description=(
        "Builds an ordered roadmap of learning phases from the resume's "
        "extracted skills and the target career, then persists it as the "
        "``roadmaps/{resumeId}`` document."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Skill analysis not found for the resume."},
    },
    tags=["Roadmap"],
)
def generate_roadmap_endpoint(
    body: models.GenerateRoadmapRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.Roadmap:
    resume_id = _require_resume(user, body.resumeId).id
    target = _target_career_for(user, resume_id)
    analysis = database.get_skill_analysis(resume_id)
    if analysis is None:
        raise HTTPException(status_code=404, detail="Run /analyze-resume first.")
    roadmap = generate_roadmap(resume_id, analysis, target)
    update_dashboard_progress(resume_id)
    _record_activity(user.uid, resume_id, "roadmap_generated")
    logger.info("Roadmap generated: uid=%s resumeId=%s", user.uid, resume_id)
    return roadmap


@api_router.post(
    "/regenerate-roadmap",
    response_model=models.Roadmap,
    summary="Re-generate the learning roadmap",
    description=(
        "Rebuilds the roadmap for a resume, overwriting the existing "
        "``roadmaps/{resumeId}`` document."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Skill analysis not found for the resume."},
    },
    tags=["Roadmap"],
)
def regenerate_roadmap_endpoint(
    body: models.RegenerateRoadmapRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.Roadmap:
    resume_id = _require_resume(user, body.resumeId).id
    target = _target_career_for(user, resume_id)
    analysis = database.get_skill_analysis(resume_id)
    if analysis is None:
        raise HTTPException(status_code=404, detail="Run /analyze-resume first.")
    roadmap = generate_roadmap(resume_id, analysis, target)
    _record_activity(user.uid, resume_id, "roadmap_generated")
    return roadmap


# --------------------------------------------------------------------------
# Courses
# --------------------------------------------------------------------------
@api_router.post(
    "/recommend-courses",
    response_model=models.CourseRecommendations,
    summary="Recommend courses for the skill gap",
    description=(
        "Produces course recommendations that close the skill gap for the "
        "target career and persists them as the "
        "``courseRecommendations/{resumeId}`` document."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Skill gap not found for the resume."},
    },
    tags=["Courses"],
)
def recommend_courses_endpoint(
    body: models.RecommendCoursesRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.CourseRecommendations:
    resume_id = _require_resume(user, body.resumeId).id
    target = _target_career_for(user, resume_id)
    gap = database.get_skill_gap(resume_id)
    if gap is None:
        raise HTTPException(status_code=404, detail="Run /analyze-resume first.")
    recs = recommend_courses(resume_id, gap, target)
    update_dashboard_progress(resume_id)
    _record_activity(user.uid, resume_id, "courses_generated")
    logger.info("Courses recommended: uid=%s resumeId=%s", user.uid, resume_id)
    return recs


# --------------------------------------------------------------------------
# Career selection
# --------------------------------------------------------------------------
@api_router.post(
    "/select-career",
    response_model=models.ActionResponse,
    summary="Select a target career (frontend orchestrates pipeline regeneration)",
    description=(
        "Sets the user's target career (persisted on the profile). The frontend "
        "is responsible for orchestrating the pipeline regeneration (analysis, "
        "roadmap, courses)."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
    },
    tags=["Career"],
)
def select_career(
    body: models.SelectCareerRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.ActionResponse:
    _require_user(user.uid)
    database.update_profile(user.uid, target_career=body.career)
    resume_id = _latest_resume_id(user)
    
    _record_activity(user.uid, None, "profile_updated")
    
    return models.ActionResponse(
        status="ok",
        message="Target career saved.",
        resumeId=resume_id,
    )


# --------------------------------------------------------------------------
# Profile / settings
# --------------------------------------------------------------------------
@api_router.put(
    "/update-profile",
    response_model=models.User,
    summary="Update the user profile",
    description=(
        "Updates mutable profile fields (display name, target career, "
        "location, phone, bio, education, social links, profile image) on "
        "the ``users/{uid}`` document and records a 'Profile Updated' "
        "activity. Returns the updated profile."
    ),
    responses={
        400: {"description": "Validation failed (e.g. empty displayName)."},
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "User not found."},
    },
    tags=["Profile"],
)
def update_profile(
    body: models.UpdateProfileRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.User:
    _require_user(user.uid)
    _validate_profile(body)
    user_doc = database.get_user(user.uid)
    old_target = user_doc.targetCareer if user_doc else None

    updated = database.update_profile(
        user.uid,
        display_name=body.displayName,
        target_career=body.targetCareer,
        location=body.location,
        phone=body.phone,
        bio=body.bio,
        education=body.education,
        linkedin=body.linkedin,
        github=body.github,
        portfolio=body.portfolio,
        profile_image=body.profileImage,
    )
    _record_activity(user.uid, None, "profile_updated")
    logger.info("Profile updated: uid=%s", user.uid)
    return updated


@api_router.get(
    "/settings",
    response_model=models.SettingsResponse,
    summary="Get current settings",
    description=(
        "Returns both the user profile and the app settings document "
        "(``settings/{uid}``)."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "User not found."},
    },
    tags=["Settings"],
)
def get_settings(
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.SettingsResponse:
    profile = _require_user(user.uid)
    settings = database.get_settings(user.uid)
    return models.SettingsResponse(profile=profile, settings=settings)


@api_router.put(
    "/settings",
    response_model=models.SettingsResponse,
    summary="Update settings",
    description=(
        "Updates app settings (theme, language, timezone, notifications, "
        "privacy, career preferences, default resume) and any supplied "
        "profile fields, then records a 'Settings Changed' activity."
    ),
    responses={
        400: {"description": "Validation failed."},
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "User not found."},
    },
    tags=["Settings"],
)
def update_settings(
    body: models.SettingsUpdateRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.SettingsResponse:
    _require_user(user.uid)
    _validate_profile(body)

    # Merge supplied settings onto the existing document.
    existing = database.get_settings(user.uid)
    merged = existing.model_copy(deep=True)
    for field in (
        "theme",
        "language",
        "timezone",
        "notifications",
        "privacy",
        "careerPreferences",
        "defaultResume",
        "savedCourses",
    ):
        val = getattr(body, field)
        if val is not None:
            setattr(merged, field, val)
    database.save_settings(user.uid, merged)

    # Apply any supplied profile fields.
    if any(
        getattr(body, f)
        for f in (
            "displayName",
            "targetCareer",
            "location",
            "phone",
            "bio",
            "education",
            "linkedin",
            "github",
            "portfolio",
            "profileImage",
        )
    ):
        user_doc = database.get_user(user.uid)
        old_target = user_doc.targetCareer if user_doc else None

        database.update_profile(
            user.uid,
            display_name=body.displayName,
            target_career=body.targetCareer,
            location=body.location,
            phone=body.phone,
            bio=body.bio,
            education=body.education,
            linkedin=body.linkedin,
            github=body.github,
            portfolio=body.portfolio,
            profile_image=body.profileImage,
        )

    _record_activity(user.uid, None, "settings_changed")
    logger.info("Settings changed: uid=%s", user.uid)
    return models.SettingsResponse(
        profile=_require_user(user.uid), settings=database.get_settings(user.uid)
    )


# --------------------------------------------------------------------------
# Read endpoints (scoped to the user / resume)
# --------------------------------------------------------------------------
@api_router.get(
    "/profile",
    response_model=models.User,
    summary="Get the user profile",
    description="Returns the ``users/{uid}`` profile document.",
    responses={401: {"description": "Missing or invalid Firebase ID token."}},
    tags=["Read"],
)
def get_profile(
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.User:
    return _require_user(user.uid)


@api_router.get(
    "/activity",
    response_model=list[models.ActivityItem],
    summary="Get paginated user activity",
    description="Returns the user's activity history, newest first. Provide a cursor to get the next page.",
    tags=["Read"],
)
def get_activity(
    limit: int = Query(default=10, le=50),
    cursor: Optional[str] = Query(default=None, description="Activity ID to start after"),
    user: models.FirebaseUser = Depends(get_current_user),
) -> list[models.ActivityItem]:
    return database.list_activity(user.uid, limit=limit, start_after_id=cursor)


@api_router.get(
    "/dashboard",
    response_model=models.DashboardDetail,
    summary="Get the complete dashboard",
    description=(
        "Aggregates the full dashboard from Firestore: profile summary, "
        "resume summary, top career, career confidence, readiness score, "
        "missing-skills count and top missing skills, current roadmap "
        "phase, recommended course, recent activity and last analysis. "
        "All values are derived from stored documents — none are hardcoded."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "No resume found for the user."},
    },
    tags=["Read"],
)
def get_dashboard(
    resumeId: Optional[str] = Query(default=None),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.DashboardDetail:
    # Fetch the user doc + resume list once and reuse them for both resume-id
    # resolution and the dashboard build (avoids duplicate Firestore reads).
    user_doc = database.get_user(user.uid)
    resumes = database.list_resumes(user.uid)
    if resumeId:
        rid: Optional[str] = resumeId
    elif user_doc and user_doc.currentResumeId:
        rid = user_doc.currentResumeId
    elif resumes:
        rid = resumes[0].id
    else:
        rid = None
    if not rid:
        raise HTTPException(status_code=404, detail="No resume found for the user.")
    detail = build_dashboard_detail(user.uid, rid, user=user_doc, resumes=resumes)
    logger.info("Dashboard loaded: uid=%s resumeId=%s", user.uid, rid)
    return detail


@api_router.get(
    "/skills",
    response_model=models.SkillAnalysis,
    summary="Get the skill analysis",
    description="Returns the extracted skill analysis for the resume.",
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Skill analysis not found for the resume."},
    },
    tags=["Read"],
)
def get_skills(
    resumeId: Optional[str] = Query(default=None),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.SkillAnalysis:
    rid = _resolve_resume_id(user, resumeId)
    doc = database.get_skill_analysis(rid)
    if doc is None:
        raise HTTPException(status_code=404, detail="Skill analysis not found.")
    return doc


@api_router.get(
    "/careers",
    response_model=models.CareerMatches,
    summary="Get career matches",
    description="Returns ranked career matches for the resume.",
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Career matches not found for the resume."},
    },
    tags=["Read"],
)
def get_careers(
    resumeId: Optional[str] = Query(default=None),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.CareerMatches:
    rid = _resolve_resume_id(user, resumeId)
    doc = database.get_career_matches(rid)
    if doc is None:
        raise HTTPException(status_code=404, detail="Career matches not found.")
    return doc


@api_router.get(
    "/skill-gap",
    response_model=models.SkillGap,
    summary="Get the skill gap",
    description="Returns the missing-skills gap for the target career.",
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Skill gap not found for the resume."},
    },
    tags=["Read"],
)
def get_skill_gap(
    resumeId: Optional[str] = Query(default=None),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.SkillGap:
    rid = _resolve_resume_id(user, resumeId)
    doc = database.get_skill_gap(rid)
    if doc is None:
        raise HTTPException(status_code=404, detail="Skill gap not found.")
    return doc


@api_router.get(
    "/roadmap",
    response_model=models.Roadmap,
    summary="Get the learning roadmap",
    description="Returns the generated roadmap for the resume.",
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Roadmap not found for the resume."},
    },
    tags=["Read"],
)
def get_roadmap(
    resumeId: Optional[str] = Query(default=None),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.Roadmap:
    rid = _resolve_resume_id(user, resumeId)
    doc = database.get_roadmap(rid)
    if doc is None:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
    return doc


@api_router.get(
    "/courses",
    response_model=models.CourseRecommendations,
    summary="Get course recommendations",
    description="Returns course recommendations for the skill gap.",
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Courses not found for the resume."},
    },
    tags=["Read"],
)
def get_courses(
    resumeId: Optional[str] = Query(default=None),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.CourseRecommendations:
    rid = _resolve_resume_id(user, resumeId)
    doc = database.get_courses(rid)
    if doc is None:
        raise HTTPException(status_code=404, detail="Courses not found.")
    return doc


@api_router.get(
    "/resumes",
    response_model=list[models.Resume],
    summary="List the user's resumes",
    description="Returns all resumes belonging to the authenticated user, newest first.",
    responses={401: {"description": "Missing or invalid Firebase ID token."}},
    tags=["Resume"],
)
def list_resumes(
    user: models.FirebaseUser = Depends(get_current_user),
) -> list[models.Resume]:
    return database.list_resumes(user.uid)


# --------------------------------------------------------------------------
# Delete (cascade)
# --------------------------------------------------------------------------
@api_router.delete(
    "/resume/{resumeId}",
    response_model=models.MessageResponse,
    summary="Delete a resume (cascade)",
    description=(
        "Hard-deletes a resume and everything tied to it: the Storage "
        "blob, the resume metadata, the processing/analysis/matches/gap/"
        "roadmap/courses/dashboard documents, and any linked activity "
        "records. Uses a single batched Firestore write so the operation "
        "stays consistent."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Resume not found for the user."},
        500: {"description": "Storage or Firestore deletion failed."},
    },
    tags=["Resume"],
)
def delete_resume(
    resumeId: str,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.MessageResponse:
    resume = _require_resume(user, resumeId)

    # Storage blob — best effort. Log, don't fail, if it's already gone.
    try:
        deleted = delete_storage_object(resume.storagePath)
        if not deleted:
            logger.warning(
                "Storage blob missing on delete: path=%s", resume.storagePath
            )
    except Exception as exc:  # noqa: BLE001 - keep the Firestore cleanup going
        logger.error("Storage delete failed: path=%s error=%s", resume.storagePath, exc)

    try:
        result = database.delete_resume_tree(user.uid, resumeId)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")
    except Exception as exc:  # noqa: BLE001
        logger.error("Firestore cascade delete failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to delete resume data.")

    logger.info(
        "Resume deleted: uid=%s resumeId=%s activity=%s",
        user.uid,
        resumeId,
        result.get("deletedActivity"),
    )
    return models.MessageResponse(status="ok", message="Resume deleted.")


# --------------------------------------------------------------------------
# Internal helpers referenced above
# --------------------------------------------------------------------------
def _resolve_resume_id(user: models.FirebaseUser, resume_id: Optional[str]) -> str:
    """Pick the resume to operate on, falling back to the user's current one."""
    if resume_id:
        return resume_id
    rid = _latest_resume_id(user)
    if rid:
        return rid
    raise HTTPException(
        status_code=404,
        detail="No resumeId supplied and the user has no current resume.",
    )


def _target_career_for(user: models.FirebaseUser, resume_id: Optional[str] = None) -> str:
    user_doc = database.get_user(user.uid)
    target = (user_doc.targetCareer if user_doc else None) or ""
    if target == "Not set":
        target = ""
    if not target and resume_id:
        matches = database.get_career_matches(resume_id)
        if matches and matches.careers:
            return matches.careers[0].careerName
    return target


def _run_full_pipeline(
    user: models.FirebaseUser, resume_id: str, target: str
) -> None:
    """Re-run the entire resume-derived pipeline for a (possibly new) target.

    Used when the user selects or changes their target career so the
    analysis, career matches, skill gap, roadmap and courses all stay keyed
    to the SAME career. The skill analysis is regenerated (the gap is
    career-specific), which cascades into a fresh roadmap and course list.
    The dashboard progress fields are refreshed from the newly generated
    roadmap/courses at the end.
    """
    try:
        text = read_resume_text(user.uid, resume_id)
    except FileNotFoundError:
        # Storage blob gone — nothing to recompute against.
        return

    analysis = run_analyze(resume_id, text, target)
    skills = _flatten_skills(analysis)
    matches = match_careers(resume_id, skills, target)
    top = matches.careers[0] if matches.careers else None
    effective_target = target if target else (top.careerName if top else "")

    gap = compute_skill_gap(resume_id, skills, effective_target)
    build_dashboard(
        resume_id,
        skills_count=len(skills),
        missing_count=len(gap.missingSkills),
        top_career=top.careerName if top else "",
        top_confidence=top.confidence if top else 0.0,
        roadmap_pct=0,
        current_phase="",
        recommended_course="",
    )
    generate_roadmap(resume_id, analysis, effective_target)
    recommend_courses(resume_id, gap, effective_target)
    update_dashboard_progress(resume_id)
    _record_activity(user.uid, resume_id, "roadmap_generated")
    _record_activity(user.uid, resume_id, "courses_generated")


def _cascade_if_target_changed(
    user: models.FirebaseUser, old_target: Optional[str], new_target: Optional[str]
) -> None:
    """If the target career actually changed, re-derive everything for it.

    Looks up the user's current resume and, when one exists, re-runs the
    full pipeline so the roadmap and courses reflect the new goal. This is
    the glue that keeps resume -> career -> roadmap -> courses in sync when
    the user edits their target career from Settings or the Resume page.
    """
    if not new_target or old_target == new_target:
        return
    resume_id = _latest_resume_id(user)
    if not resume_id:
        return
    _run_full_pipeline(user, resume_id, new_target)
