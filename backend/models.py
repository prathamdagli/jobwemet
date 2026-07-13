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

from pydantic import BaseModel, ConfigDict, Field, field_validator

# --- Literals (match the Firestore enum strings) ------------------------
# Allowed values for app settings (mirrored by the frontend's <select> options).
VALID_THEMES = {"system", "light", "dark"}
VALID_LANGUAGES = {"en", "es", "de", "fr"}
Provider = Literal["password", "google"]
ResumeStatus = Literal["uploaded", "deleted"]
AnalysisStatus = Literal["processing", "completed", "failed"]
ProcessingStatus = Literal["queued", "processing", "completed", "failed"]
Priority = Literal["high", "medium", "low"]
GapDifficulty = Literal["easy", "moderate", "hard"]
PhaseStatus = Literal["completed", "in_progress", "locked"]
ActivityType = Literal[
    "resume_uploaded",
    "resume_analysed",
    "roadmap_generated",
    "courses_generated",
    "profile_updated",
    "settings_changed",
]

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
    # Extended profile fields (read/written by the backend; the frozen
    # frontend ignores any it does not render).
    bio: Optional[str] = None
    education: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    profileImage: Optional[str] = None


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
    # Per-category AI confidence (0-100), computed independently for each
    # skill group. The aggregate ConfidenceInfo.overall/skills values are
    # DERIVED from these per-category scores (never hardcoded separately).
    confidence: float = 0.0


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
    description: str = ""
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
    """``dashboardSummary/{resumeId}`` document (consumed by the frontend)."""

    overallReadiness: float = 0
    topCareer: str = ""
    topCareerConfidence: float = 0
    skillsCount: int = 0
    missingSkillsCount: int = 0
    completedRoadmapPct: int = 0
    currentPhase: str = ""
    recommendedCourse: str = ""


class Processing(BaseModel):
    """``resumeProcessing/{resumeId}`` document.

    ``userId`` is required so the frontend's ``where('userId','==',uid)``
    query can surface processing state for the signed-in user.
    """

    resumeId: str
    userId: Optional[str] = None
    status: ProcessingStatus = "queued"
    progress: Optional[float] = None


class ActivityItem(BaseModel):
    """``users/{uid}/activity/{activityId}`` document."""

    id: Optional[str] = None
    userId: Optional[str] = None
    resumeId: Optional[str] = None
    activityType: ActivityType
    title: str
    description: str = ""
    timestamp: Optional[datetime] = None


# --- Settings (stored in ``settings/{uid}``) ----------------------------


class NotificationSettings(BaseModel):
    email: bool = True
    push: bool = True
    browser: bool = True


class PrivacySettings(BaseModel):
    profileVisible: bool = True
    shareAcademicData: bool = False


class CareerPreferences(BaseModel):
    targetRole: Optional[str] = None
    industry: Optional[str] = None
    remotePreferred: bool = False


class Settings(BaseModel):
    """``settings/{uid}`` document."""

    theme: str = "system"  # light | dark | system
    language: str = "en"
    timezone: Optional[str] = None
    notifications: NotificationSettings = Field(default_factory=NotificationSettings)
    privacy: PrivacySettings = Field(default_factory=PrivacySettings)
    careerPreferences: CareerPreferences = Field(default_factory=CareerPreferences)
    defaultResume: Optional[str] = None
    savedCourses: list[str] = Field(default_factory=list)

    # Lenient on read: an unknown stored value falls back to the default so a
    # corrupt document never crashes the GET /settings response.
    @field_validator("theme")
    @classmethod
    def _coerce_theme(cls, v: str) -> str:
        return v if v in VALID_THEMES else "system"

    @field_validator("language")
    @classmethod
    def _coerce_language(cls, v: str) -> str:
        return v if v in VALID_LANGUAGES else "en"


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


class SelectCareerRequest(BaseModel):
    """Set the active target career and re-derive the pipeline for it."""

    career: str = Field(..., min_length=1, max_length=100)


class UpdateProfileRequest(BaseModel):
    """Editable profile fields (also accepted by PUT /settings)."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "displayName": "Jane Doe",
                "targetCareer": "Backend Engineer",
                "location": "Berlin, Germany",
                "phone": "+49 123 456789",
                "bio": "Full-stack developer pivoting to backend.",
                "education": "B.Sc. Computer Science",
                "linkedin": "https://linkedin.com/in/janedoe",
                "github": "https://github.com/janedoe",
                "portfolio": "https://janedoe.dev",
            }
        }
    )

    displayName: Optional[str] = None
    targetCareer: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    profileImage: Optional[str] = None


class SettingsUpdateRequest(BaseModel):
    """App settings plus optional profile fields (all optional)."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "theme": "dark",
                "language": "en",
                "timezone": "Europe/Berlin",
                "notifications": {"email": True, "push": False, "browser": True},
                "privacy": {"profileVisible": True, "shareAcademicData": False},
                "careerPreferences": {
                    "targetRole": "Backend Engineer",
                    "industry": "Fintech",
                    "remotePreferred": True,
                },
                "defaultResume": None,
            }
        }
    )

    # Settings
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    notifications: Optional[NotificationSettings] = None
    privacy: Optional[PrivacySettings] = None
    careerPreferences: Optional[CareerPreferences] = None
    defaultResume: Optional[str] = None
    savedCourses: Optional[list[str]] = None
    # Profile (mirrors UpdateProfileRequest)

    # Strict on write: a caller-supplied invalid theme/language is rejected
    # with a 422 rather than silently coerced.
    @field_validator("theme")
    @classmethod
    def _check_theme(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_THEMES:
            raise ValueError("theme must be one of 'system', 'light', 'dark'.")
        return v

    @field_validator("language")
    @classmethod
    def _check_language(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_LANGUAGES:
            raise ValueError("language must be one of 'en', 'es', 'de', 'fr'.")
        return v
    displayName: Optional[str] = None
    targetCareer: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    profileImage: Optional[str] = None


class FirebaseUser(BaseModel):
    """Decoded identity of the caller (from the Firebase ID token)."""

    uid: str
    email: Optional[str] = None
    name: Optional[str] = None


# ======================================================================
# Response models (envelopes / aggregates)
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


class SettingsResponse(BaseModel):
    """GET /settings payload: the user profile plus app settings."""

    profile: User
    settings: Settings


# --- Dashboard aggregate (GET /dashboard) --------------------------------


class ProfileSummary(BaseModel):
    uid: str = ""
    displayName: str = ""
    email: str = ""
    targetCareer: str = ""
    location: Optional[str] = None
    profileCompletion: int = 0


class ResumeSummary(BaseModel):
    totalResumes: int = 0
    latestResumeId: Optional[str] = None
    latestResumeName: Optional[str] = None
    latestUploadedAt: Optional[datetime] = None


class LastAnalysis(BaseModel):
    status: Optional[str] = None
    skillsCount: int = 0
    softSkillsCount: int = 0
    analyzedAt: Optional[datetime] = None


class DashboardDetail(BaseModel):
    """Complete dashboard assembled from Firestore on each request."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "overallReadiness": 64,
                "topCareer": "Backend Engineer",
                "topCareerConfidence": 82,
                "skillsCount": 14,
                "missingSkillsCount": 6,
                "completedRoadmapPct": 25,
                "currentPhase": "Build a REST API",
                "recommendedCourse": "Python for Everybody",
                "topMissingSkills": ["Kubernetes", "gRPC", "GraphQL"],
                "profileSummary": {
                    "uid": "abc123",
                    "displayName": "Jane Doe",
                    "email": "jane@example.com",
                    "targetCareer": "Backend Engineer",
                    "location": "Berlin",
                    "profileCompletion": 70,
                },
                "resumeSummary": {
                    "totalResumes": 2,
                    "latestResumeId": "res_001",
                    "latestResumeName": "jane_resume.pdf",
                },
                "recentActivity": [
                    {
                        "activityType": "resume_uploaded",
                        "title": "Resume Uploaded",
                        "description": "jane_resume.pdf",
                    }
                ],
                "lastAnalysis": {
                    "status": "completed",
                    "skillsCount": 14,
                    "softSkillsCount": 4,
                },
            }
        }
    )

    # Base fields — mirror the stored dashboardSummary document.
    overallReadiness: float = 0
    topCareer: str = ""
    topCareerConfidence: float = 0
    skillsCount: int = 0
    missingSkillsCount: int = 0
    completedRoadmapPct: int = 0
    currentPhase: str = ""  # Current Roadmap Phase
    recommendedCourse: str = ""  # Recommended Course
    # Rich aggregates.
    topMissingSkills: list[str] = Field(default_factory=list)
    profileSummary: ProfileSummary = Field(default_factory=ProfileSummary)
    resumeSummary: ResumeSummary = Field(default_factory=ResumeSummary)
    recentActivity: list[ActivityItem] = Field(default_factory=list)
    lastAnalysis: Optional[LastAnalysis] = None
