"""Pydantic models for the JobWeMet API.

Field names intentionally mirror the Firestore document keys (camelCase)
so documents round-trip to/from the database with no extra mapping.
Models fall into three groups:

  * **Entities**        -> stored Firestore documents
  * **Request models**  -> request bodies for write endpoints
  * **Response models** -> envelopes returned by the API

Keep this file dependency-free (no Firebase imports) so it can be
reused by tests and the API layer alike.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

# --- Literals (match the Firestore enum strings) ------------------------
Provider = Literal["password", "google"]
ResumeStatus = Literal["uploaded", "deleted"]
AnalysisStatus = Literal["processing", "completed", "failed"]
ProcessingStatus = Literal["queued", "processing", "completed", "failed"]
Priority = Literal["high", "medium", "low"]
GapDifficulty = Literal["easy", "moderate", "hard"]
PhaseStatus = Literal["completed", "in_progress", "locked"]

# ======================================================================
# Entities (Firestore documents)
# ======================================================================


class User(BaseModel):
    """``users/{uid}`` document."""

    uid: str
    displayName: str
    email: str
    photoURL: Optional[str] = None
    provider: Provider = "password"
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    onboardingCompleted: bool = False
    profileCompletion: int = 0
    targetCareer: str = ""
    currentResumeId: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None


class Resume(BaseModel):
    """``resumes/{resumeId}`` document."""

    id: str
    userId: str
    fileName: str
    originalFileName: str
    storagePath: str
    mimeType: str
    fileSize: int
    status: ResumeStatus = "uploaded"
    uploadedAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class SkillGroup(BaseModel):
    category: str
    skills: list[str] = Field(default_factory=list)


class ExperienceInfo(BaseModel):
    years: int = 0
    currentRole: str = ""
    previousRoles: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)


class EducationInfo(BaseModel):
    highestQualification: str = ""


class ConfidenceInfo(BaseModel):
    overall: float = 0
    skills: float = 0
    careerMatch: float = 0


class SkillAnalysis(BaseModel):
    """``skillAnalysis/{resumeId}`` document."""

    status: AnalysisStatus = "processing"
    technicalSkills: Optional[list[SkillGroup]] = None
    softSkills: Optional[list[str]] = None
    experience: Optional[ExperienceInfo] = None
    education: Optional[EducationInfo] = None
    confidence: Optional[ConfidenceInfo] = None


class CareerMatchItem(BaseModel):
    careerName: str
    confidence: float = 0
    reason: str = ""
    topMatchingSkills: list[str] = Field(default_factory=list)


class CareerMatches(BaseModel):
    """``careerMatches/{resumeId}`` document."""

    careers: list[CareerMatchItem] = Field(default_factory=list)


class SkillGapItem(BaseModel):
    skill: str
    priority: Priority = "medium"
    difficulty: GapDifficulty = "moderate"
    estimatedLearningTime: str = ""


class SkillGap(BaseModel):
    """``skillGap/{resumeId}`` document."""

    missingSkills: list[SkillGapItem] = Field(default_factory=list)


class RoadmapPhase(BaseModel):
    order: int
    title: str
    description: str = ""
    estimatedHours: int = 0
    priority: Priority = "medium"
    requiredSkills: list[str] = Field(default_factory=list)
    completionStatus: PhaseStatus = "locked"
    estimatedCompletionTime: str = ""


class Roadmap(BaseModel):
    """``roadmaps/{resumeId}`` document."""

    status: Optional[str] = None
    phases: list[RoadmapPhase] = Field(default_factory=list)


class CourseRec(BaseModel):
    title: str
    provider: str
    skill: str
    difficulty: GapDifficulty = "moderate"
    estimatedDuration: str = ""
    url: str = ""
    rating: float = 0
    priority: Priority = "medium"


class CourseRecommendations(BaseModel):
    """``courseRecommendations/{resumeId}`` document."""

    courses: list[CourseRec] = Field(default_factory=list)


class DashboardSummary(BaseModel):
    """``dashboardSummary/{resumeId}`` document."""

    overallReadiness: float = 0
    topCareer: str = ""
    topCareerConfidence: float = 0
    skillsCount: int = 0
    missingSkillsCount: int = 0
    completedRoadmapPct: int = 0
    currentPhase: str = ""
    recommendedCourse: str = ""


class Processing(BaseModel):
    """``resumeProcessing/{resumeId}`` document."""

    resumeId: str
    status: ProcessingStatus = "queued"
    progress: Optional[float] = None


# ======================================================================
# Request models
# ======================================================================


class ProcessResumeRequest(BaseModel):
    resumeId: str


class AnalyzeResumeRequest(BaseModel):
    resumeId: str


class GenerateRoadmapRequest(BaseModel):
    resumeId: str


class RecommendCoursesRequest(BaseModel):
    resumeId: str


class RegenerateAnalysisRequest(BaseModel):
    resumeId: str


class RegenerateRoadmapRequest(BaseModel):
    resumeId: str


class UpdateProfileRequest(BaseModel):
    """Editable profile fields (also used by PUT /settings)."""

    displayName: Optional[str] = None
    targetCareer: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None


class FirebaseUser(BaseModel):
    """Decoded identity of the caller (from the Firebase ID token)."""

    uid: str
    email: Optional[str] = None
    name: Optional[str] = None


# ======================================================================
# Response models (envelopes)
# ======================================================================


class MessageResponse(BaseModel):
    status: str = "ok"
    message: str = ""


class ResumeUploadResponse(BaseModel):
    resumeId: str
    fileName: str
    storagePath: str
    status: ResumeStatus = "uploaded"


class ActionResponse(BaseModel):
    """Generic result for heavy/async actions (processing, AI generation)."""

    status: str = "accepted"
    message: str = ""
    resumeId: Optional[str] = None
    data: Optional[Any] = None
