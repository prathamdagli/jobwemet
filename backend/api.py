"""All REST API endpoints for the JobWeMet backend.

This module is intentionally the single home for every route. The
frontend talks to these endpoints; nothing here calls Firebase Cloud
Functions (those no longer exist). Authentication is performed by
verifying a Firebase ID token passed as a Bearer header.

Every endpoint is documented for Swagger with a summary, description,
request/response models and status codes.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse

from . import config, database, models, utils
from .career import analyze_resume as run_analyze
from .career import build_dashboard, compute_skill_gap, match_careers
from .courses import recommend_courses
from .firebase import get_auth
from .resume import (
    create_resume_record,
    extract_text_from_bytes,
    mark_processing,
    read_resume_text,
    upload_bytes,
    validate_resume_file,
)
from .roadmap import generate_roadmap

api_router = APIRouter()


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
    authorization: str = Header(default=""),
) -> models.FirebaseUser:
    """Resolve the calling user from a Firebase ID token.

    In production ``REQUIRE_AUTH`` is True and a valid Bearer token is
    mandatory. During local development (emulator / Swagger) auth is
    optional and an artificial demo user is substituted so the API can
    be exercised without minting tokens.
    """
    token = _extract_bearer(authorization)
    if token:
        try:
            decoded = get_auth().verify_id_token(token)
            return models.FirebaseUser(
                uid=decoded["uid"],
                email=decoded.get("email"),
                name=decoded.get("name"),
            )
        except Exception:  # noqa: BLE001 - surface a clean 401 on bad tokens
            if config.REQUIRE_AUTH:
                raise HTTPException(
                    status_code=401, detail="Invalid or expired Firebase ID token."
                )
    if config.REQUIRE_AUTH:
        raise HTTPException(
            status_code=401, detail="Authorization Bearer token is required."
        )
    return models.FirebaseUser(uid=config.DEMO_UID, email="dev@example.com", name="Dev User")


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _resolve_resume_id(user: models.FirebaseUser, resume_id: Optional[str]) -> str:
    """Pick the resume to operate on, falling back to the user's current one."""
    if resume_id:
        return resume_id
    user_doc = database.get_user(user.uid)
    if user_doc and user_doc.currentResumeId:
        return user_doc.currentResumeId
    raise HTTPException(
        status_code=404,
        detail="No resumeId supplied and the user has no current resume.",
    )


def _target_career_for(user: models.FirebaseUser) -> str:
    user_doc = database.get_user(user.uid)
    return (user_doc.targetCareer if user_doc else None) or ""


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
        "creates the ``resumes`` document (status ``uploaded``) and a "
        "``resumeProcessing`` document, then returns the new resume id."
    ),
    responses={
        400: {"description": "Unsupported file type or empty/invalid upload."},
        401: {"description": "Missing or invalid Firebase ID token."},
    },
    tags=["Resume"],
)
async def upload_resume(
    file: UploadFile = File(..., description="PDF or DOCX resume file."),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.ResumeUploadResponse:
    data = await file.read()
    try:
        ext = validate_resume_file(
            file.filename or "resume", file.content_type, len(data)
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    resume_id = utils.generate_id("res_")
    storage_path = upload_bytes(user.uid, resume_id, data, ext)
    record = create_resume_record(
        user.uid, resume_id, file.filename or "resume", file.content_type or "", len(data), storage_path
    )
    mark_processing(resume_id, status="queued")
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
    try:
        text = read_resume_text(user.uid, body.resumeId)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")
    mark_processing(body.resumeId, status="processing", progress=50)
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
    resume_id = _resolve_resume_id(user, body.resumeId)
    target = _target_career_for(user)
    try:
        text = read_resume_text(user.uid, resume_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")

    analysis = run_analyze(resume_id, text, target)
    skills = [
        s
        for grp in (analysis.technicalSkills or [])
        for s in grp.skills
    ]
    matches = match_careers(resume_id, skills, target)
    gap = compute_skill_gap(resume_id, skills, target)
    top = matches.careers[0] if matches.careers else None
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
    mark_processing(resume_id, status="completed", progress=100)
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
    resume_id = _resolve_resume_id(user, body.resumeId)
    target = _target_career_for(user)
    try:
        text = read_resume_text(user.uid, resume_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return run_analyze(resume_id, text, target)


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
    resume_id = _resolve_resume_id(user, body.resumeId)
    target = _target_career_for(user)
    analysis = database.get_skill_analysis(resume_id)
    if analysis is None:
        raise HTTPException(status_code=404, detail="Run /analyze-resume first.")
    return generate_roadmap(resume_id, analysis, target)


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
    resume_id = _resolve_resume_id(user, body.resumeId)
    target = _target_career_for(user)
    analysis = database.get_skill_analysis(resume_id)
    if analysis is None:
        raise HTTPException(status_code=404, detail="Run /analyze-resume first.")
    return generate_roadmap(resume_id, analysis, target)


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
    resume_id = _resolve_resume_id(user, body.resumeId)
    target = _target_career_for(user)
    gap = database.get_skill_gap(resume_id)
    if gap is None:
        raise HTTPException(status_code=404, detail="Run /analyze-resume first.")
    return recommend_courses(resume_id, gap, target)


# --------------------------------------------------------------------------
# Profile / settings
# --------------------------------------------------------------------------
@api_router.put(
    "/update-profile",
    response_model=models.MessageResponse,
    summary="Update the user profile",
    description=(
        "Updates mutable profile fields (display name, target career, "
        "location, phone) on the ``users/{uid}`` document."
    ),
    responses={401: {"description": "Missing or invalid Firebase ID token."}},
    tags=["Profile"],
)
def update_profile(
    body: models.UpdateProfileRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.MessageResponse:
    database.update_profile(
        user.uid,
        display_name=body.displayName,
        target_career=body.targetCareer,
        location=body.location,
        phone=body.phone,
    )
    return models.MessageResponse(status="ok", message="Profile updated.")


@api_router.get(
    "/settings",
    response_model=models.User,
    summary="Get current settings",
    description="Returns the ``users/{uid}`` document (account settings).",
    responses={401: {"description": "Missing or invalid Firebase ID token."}},
    tags=["Profile"],
)
def get_settings(
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.User:
    doc = database.get_user(user.uid)
    if doc is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return doc


@api_router.put(
    "/settings",
    response_model=models.MessageResponse,
    summary="Update settings",
    description=(
        "Updates account settings on the ``users/{uid}`` document "
        "(display name, target career, location, phone)."
    ),
    responses={401: {"description": "Missing or invalid Firebase ID token."}},
    tags=["Profile"],
)
def update_settings(
    body: models.UpdateProfileRequest,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.MessageResponse:
    database.update_profile(
        user.uid,
        display_name=body.displayName,
        target_career=body.targetCareer,
        location=body.location,
        phone=body.phone,
    )
    return models.MessageResponse(status="ok", message="Settings updated.")


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
    doc = database.get_user(user.uid)
    if doc is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return doc


@api_router.get(
    "/dashboard",
    response_model=models.DashboardSummary,
    summary="Get the dashboard summary",
    description="Returns the dashboard summary for the user's current resume.",
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Dashboard not found for the resume."},
    },
    tags=["Read"],
)
def get_dashboard(
    resumeId: Optional[str] = Query(default=None),
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.DashboardSummary:
    rid = _resolve_resume_id(user, resumeId)
    doc = database.get_dashboard(rid)
    if doc is None:
        raise HTTPException(status_code=404, detail="Dashboard not found.")
    return doc


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
    description="Returns all resumes belonging to the authenticated user.",
    responses={401: {"description": "Missing or invalid Firebase ID token."}},
    tags=["Resume"],
)
def list_resumes(
    user: models.FirebaseUser = Depends(get_current_user),
) -> list[models.Resume]:
    return database.list_resumes(user.uid)


# --------------------------------------------------------------------------
# Delete
# --------------------------------------------------------------------------
@api_router.delete(
    "/resume/{resumeId}",
    response_model=models.MessageResponse,
    summary="Delete a resume",
    description=(
        "Soft-deletes a resume (status ``deleted``) so its history is "
        "retained while it is hidden from listing."
    ),
    responses={
        401: {"description": "Missing or invalid Firebase ID token."},
        404: {"description": "Resume not found for the user."},
    },
    tags=["Resume"],
)
def delete_resume(
    resumeId: str,
    user: models.FirebaseUser = Depends(get_current_user),
) -> models.MessageResponse:
    try:
        database.delete_resume(user.uid, resumeId)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return models.MessageResponse(status="ok", message="Resume deleted.")
