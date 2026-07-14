"""Business-logic layer for the JobWeMet backend.

This module consolidates the resume-analysis pipeline that was previously
split across ``ai.py``, ``resume.py``, ``career.py``, ``courses.py``,
``dashboard.py`` and ``roadmap.py``. It owns:

  * the AI provider abstraction (every AI call routes through here — no
    endpoint or domain function imports a provider SDK directly),
  * resume handling (validation, text extraction, Storage upload),
  * career matching / skill gap / dashboard assembly,
  * course recommendations,
  * roadmap generation.

Everything is persisted back to Firestore via :mod:`database` so the
frontend's realtime listeners light up. The Firebase Admin SDK clients
(``get_db`` / ``get_auth`` / ``get_bucket``) live in :mod:`database`.
"""
from __future__ import annotations

import concurrent.futures
import json
import logging
import re
import time
from abc import ABC, abstractmethod
from typing import Optional

import requests

from . import config, database, models, utils

logger = logging.getLogger("jobwemet.services")

# ==========================================================================
# AI provider abstraction
# ==========================================================================
# Every AI call in the application goes through this section — no endpoint
# or domain function imports a provider SDK directly. Today a deterministic
# ``stub`` provider is used when no real key is configured; otherwise the
# configured provider (Groq) is used for the four generative stages of
# the resume pipeline: skill extraction, career matching, skill-gap analysis
# and roadmap generation. (Course recommendations are catalog-driven and live
# in the course-provider section below, not here.)
#
# Adding another provider later means adding one provider class and a branch
# in :func:`get_provider`; nothing else in the app changes.

# How long to wait on a provider before giving up.
_TIMEOUT_SECONDS = config.AI_TIMEOUT_SECONDS

# Errors worth retrying once (transient / bad output). Auth and quota
# failures are not retried — retrying them cannot help.
_RETRYABLE = {"ai_timeout", "ai_unavailable", "ai_error", "ai_malformed"}


class AIError(Exception):
    """Raised when the AI provider fails in a way the API should surface.

    Carries an HTTP ``status_code`` and a stable ``code`` so the global
    exception handler can return a meaningful error instead of 500-ing.
    """

    def __init__(self, message: str, *, status_code: int = 502, code: str = "ai_error"):
        super().__init__(message)
        self.status_code = status_code
        self.code = code


class AIProvider(ABC):
    """Common contract every provider implements."""

    name: str = "base"

    @abstractmethod
    def complete(self, prompt: str, *, system: Optional[str] = None) -> str:
        """Return the model's text for a prompt."""
        raise NotImplementedError


class StubProvider(AIProvider):
    """Deterministic stand-in used when no real key is set.

    Lets the full pipeline run end-to-end (and keeps Swagger honest)
    without spending tokens or requiring secrets. This is the intentional
    fallback only — production runs the Groq provider.
    """

    name = "stub"

    def complete(self, prompt: str, *, system: Optional[str] = None) -> str:
        return (
            "[stub] AI provider is not configured. Set AI_PROVIDER=groq "
            "and GROQ_API_KEY in .env to enable real generation."
        )


class GroqProvider(AIProvider):
    """Groq API client integration."""

    name = "groq"

    def __init__(self, api_key: str, model: str) -> None:
        import groq
        self._model = model
        self._client = groq.Groq(
            api_key=api_key,
            max_retries=0, # We handle retries at a higher level
            timeout=_TIMEOUT_SECONDS,
        )

    def complete(self, prompt: str, *, system: Optional[str] = None) -> str:
        import groq
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        started = time.monotonic()
        try:
            resp = self._client.chat.completions.create(
                model=self._model,
                messages=messages,
                temperature=0.2,
            )
        except groq.AuthenticationError as exc:
            raise AIError(
                "Invalid or unauthorized Groq API key.",
                status_code=401,
                code="ai_auth",
            ) from exc
        except groq.NotFoundError as exc:
            raise AIError(
                "Groq model or endpoint not found.",
                status_code=404,
                code="ai_not_found",
            ) from exc
        except groq.RateLimitError as exc:
            raise AIError(
                f"AI provider quota exceeded. Check the Groq key's credits / rate limits. {str(exc)[:200]}",
                status_code=429,
                code="ai_quota",
            ) from exc
        except groq.APITimeoutError as exc:
            raise AIError(
                "The AI provider request timed out.",
                status_code=408,
                code="ai_timeout",
            ) from exc
        except groq.APIConnectionError as exc:
            raise AIError(
                f"The AI provider is unreachable: {exc}",
                status_code=502,
                code="ai_unavailable",
            ) from exc
        except groq.APIStatusError as exc:
            if exc.status_code == 503:
                raise AIError(
                    "The AI provider is temporarily unavailable.",
                    status_code=503,
                    code="ai_unavailable",
                ) from exc
            raise AIError(
                f"Groq API error {exc.status_code}: {str(exc)[:300]}",
                status_code=502,
                code="ai_error",
            ) from exc
        except Exception as exc:
            raise AIError(
                f"Unexpected Groq API error: {str(exc)[:300]}",
                status_code=502,
                code="ai_error",
            ) from exc

        latency_ms = int((time.monotonic() - started) * 1000)
        request_id = getattr(resp, "id", None)
        usage = getattr(resp, "usage", None)
        
        # Log operational signal only — never the prompt or the API key.
        logger.info(
            "groq model=%s latency_ms=%d request_id=%s usage=%s",
            self._model,
            latency_ms,
            request_id,
            usage,
        )

        try:
            text = resp.choices[0].message.content
        except (KeyError, IndexError, ValueError, AttributeError) as exc:
            raise AIError(
                "The AI provider returned an empty or malformed response.",
                status_code=502,
                code="ai_malformed",
            ) from exc
            
        if not text or not text.strip():
            raise AIError(
                "The AI provider returned an empty response.",
                status_code=502,
                code="ai_empty",
            )
        return text


def get_provider() -> AIProvider:
    """Return the configured provider (factory)."""
    if config.AI_PROVIDER == "groq" and config.GROQ_API_KEY:
        return GroqProvider(
            config.GROQ_API_KEY,
            config.GROQ_MODEL,
        )
    return StubProvider()


def chat(prompt: str, *, system: Optional[str] = None) -> str:
    """Route a prompt to the active provider."""
    return get_provider().complete(prompt, system=system)


def _is_stub() -> bool:
    """True when the active provider is the deterministic fallback."""
    return get_provider().name == "stub"


# --------------------------------------------------------------------------
# JSON extraction — robust against markdown fences / prose around the JSON.
# --------------------------------------------------------------------------


def _parse_ai_json(raw: str) -> dict:
    text = raw.strip()
    # Strip ```json ... ``` fences if the model wrapped its answer.
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Fall back to the outermost {...} block.
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass
    raise AIError(
        "The AI provider returned a response that could not be parsed as JSON.",
        status_code=502,
        code="ai_malformed",
    )


def _generate(prompt: str, system: Optional[str] = None) -> dict:
    """Call the model and parse its JSON, retrying once on retryable failure.

    A single retry covers transient errors (timeout / 5xx / unreachable) and
    malformed JSON. The retry is exactly once; a second failure is surfaced
    as an :class:`AIError` so the request degrades gracefully.
    """
    try:
        return _parse_ai_json(chat(prompt, system=system))
    except AIError as exc:
        if exc.code in _RETRYABLE:
            return _parse_ai_json(chat(prompt, system=system))
        raise


# --------------------------------------------------------------------------
# Normalizers — keep Pydantic models from 500-ing on slightly-off output.
# --------------------------------------------------------------------------

_VALID_PRIORITY = {"high", "medium", "low"}
_VALID_DIFFICULTY = {"easy", "moderate", "hard"}
_VALID_PHASE = {"completed", "in_progress", "locked"}


def _priority(v) -> str:
    return v if v in _VALID_PRIORITY else "medium"


def _difficulty(v) -> str:
    return v if v in _VALID_DIFFICULTY else "moderate"


def _phase(v) -> str:
    return v if v in _VALID_PHASE else "locked"


def _as_str(v) -> str:
    return "" if v is None else str(v)


def _as_list(v) -> list:
    return [x for x in (v or []) if x is not None]


def _as_float(v, default: float = 0.0) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _as_int(v, default: int = 0) -> int:
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


_SYSTEM = (
    "You are JobWeMet's career-intelligence engine. You always reply with a "
    "single, strict JSON object and nothing else — no prose, no markdown, "
    "no code fences, no explanations. Return ONLY valid JSON. Use only the "
    "exact field names and value sets requested. Numbers stay numbers, "
    "not strings."
)


# --------------------------------------------------------------------------
# Domain helpers — build structured data for the pipeline.
#
# Each returns a plain dict the caller wraps in a Pydantic model. When the
# Groq provider is active the dict is produced by a real generation
# call; when only the stub is configured a deterministic placeholder is
# returned (intentional fallback, never billed).
# --------------------------------------------------------------------------


def analyze_resume_text(resume_text: str, target_career: str) -> dict:
    """Extract skills, experience and education from resume text."""
    if _is_stub():
        groups = [
            {"category": "Programming", "skills": ["Python", "SQL"], "confidence": 82},
            {"category": "Tools", "skills": ["Git", "Docker"], "confidence": 64},
            {"category": "Databases", "skills": ["PostgreSQL"], "confidence": 71},
        ]
        return {
            "status": "completed",
            "technicalSkills": groups,
            "softSkills": ["Communication", "Problem Solving"],
            "experience": {
                "years": 2,
                "currentRole": "Junior Developer",
                "previousRoles": [],
                "projects": [],
            },
            "education": {"highestQualification": "Bachelor's"},
            "confidence": _derive_confidence(groups, 65),
        }
    prompt = (
        "Analyse the resume text below and return STRICT JSON with this exact "
        "shape:\n"
        "{\n"
        '  "technicalSkills": [{"category": "string", "skills": ["string"], '
        '"confidence": 0-100}],\n'
        '  "softSkills": ["string"],\n'
        '  "experience": {"years": int, "currentRole": "string", '
        '"previousRoles": ["string"], "projects": ["string"]},\n'
        '  "education": {"highestQualification": "string"},\n'
        '  "confidence": {"careerMatch": 0-100}\n'
        "}\n"
        f"Target career (may be 'unspecified'): {target_career or 'unspecified'}.\n"
        "Each technicalSkills group MUST carry its OWN confidence (0-100) "
        "reflecting how strongly the resume demonstrates that category. Do NOT "
        "use the same confidence for every group. Return ONLY valid JSON. "
        "Resume text:\n\"\"\"\n"
        + (resume_text or "")[:12000]
        + "\n\"\"\""
    )
    data = _generate(prompt, system=_SYSTEM)
    groups = [
        {
            "category": _as_str(g.get("category")),
            "skills": [str(s) for s in _as_list(g.get("skills"))],
            "confidence": _as_float(g.get("confidence")),
        }
        for g in _as_list(data.get("technicalSkills"))
        if isinstance(g, dict) and g.get("category")
    ]
    ai_conf = data.get("confidence") or {}
    experience = data.get("experience") or {}
    education = data.get("education") or {}
    return {
        "status": "completed",
        "technicalSkills": groups,
        "softSkills": [str(s) for s in _as_list(data.get("softSkills"))],
        "experience": {
            "years": _as_int(experience.get("years")),
            "currentRole": _as_str(experience.get("currentRole")),
            "previousRoles": [str(r) for r in _as_list(experience.get("previousRoles"))],
            "projects": [str(p) for p in _as_list(experience.get("projects"))],
        },
        "education": {"highestQualification": _as_str(education.get("highestQualification"))},
        # Overall/skills confidence is DERIVED from the per-category scores.
        "confidence": _derive_confidence(groups, _as_float(ai_conf.get("careerMatch"))),
    }


def _derive_confidence(
    groups: list[dict], career_match: float
) -> dict:
    """Derive aggregate confidence from per-category scores.

    overall/skills are the mean of the individual category confidences so the
    headline number always reflects the real per-category spread (never a
    separate hardcoded figure). careerMatch comes straight from the AI.
    """
    cat_scores = [g.get("confidence", 0.0) for g in groups if g.get("confidence")]
    overall = round(sum(cat_scores) / len(cat_scores)) if cat_scores else 0
    return {
        "overall": overall,
        "skills": overall,
        "careerMatch": career_match,
    }


def build_career_matches(skills: list[str]) -> dict:
    """Rank careers that fit the candidate's skill set."""
    if _is_stub():
        return {
            "careers": [
                {
                    "careerName": "Software Engineer",
                    "confidence": 0.82,
                    "description": "Design, develop, and maintain software systems.",
                    "reason": "Strong overlap with the candidate's profile.",
                    "topMatchingSkills": _as_list(skills)[:3],
                }
            ]
        }
    prompt = (
        "Given the candidate's skills, rank the best-fit careers for this candidate "
        "and return STRICT JSON:\n"
        '{"careers": [{"careerName": string, "confidence": 0-1 float, '
        '"description": "Short 1-sentence description of the role itself", '
        '"reason": "Detailed explanation of why the candidate is a good fit for this role based on their skills", '
        '"topMatchingSkills": ["string"]}]}\n'
        f"Candidate skills: {list(_as_list(skills))}.\n"
        "Include 3-6 careers. confidence must be a float between 0 and 1. "
        "Return ONLY valid JSON."
    )
    data = _generate(prompt, system=_SYSTEM)
    careers = [
        {
            "careerName": _as_str(c.get("careerName")),
            "confidence": max(0.0, min(1.0, _as_float(c.get("confidence"), 0.5))),
            "description": _as_str(c.get("description")),
            "reason": _as_str(c.get("reason")),
            "topMatchingSkills": [str(s) for s in _as_list(c.get("topMatchingSkills"))],
        }
        for c in _as_list(data.get("careers"))
        if isinstance(c, dict) and c.get("careerName")
    ]
    return {"careers": careers}


def build_skill_gap(skills: list[str], target_career: str) -> dict:
    """Identify the skills missing for the target career."""
    if _is_stub():
        return {
            "missingSkills": [
                {
                    "skill": "System Design",
                    "priority": "high",
                    "difficulty": "hard",
                    "estimatedLearningTime": "4 weeks",
                }
            ]
        }
    prompt = (
        "List the skills the candidate is missing for the target career and "
        "return STRICT JSON:\n"
        '{"missingSkills": [{"skill": string, "priority": "high"|"medium"|"low", '
        '"difficulty": "easy"|"moderate"|"hard", "estimatedLearningTime": string}]}\n'
        f"Target career (may be 'unspecified'): {target_career or 'unspecified'}.\n"
        f"Candidate skills: {list(_as_list(skills))}.\n"
        "priority and difficulty MUST be one of the listed allowed values. "
        "Return ONLY valid JSON."
    )
    data = _generate(prompt, system=_SYSTEM)
    missing = [
        {
            "skill": _as_str(s.get("skill")),
            "priority": _priority(s.get("priority")),
            "difficulty": _difficulty(s.get("difficulty")),
            "estimatedLearningTime": _as_str(s.get("estimatedLearningTime")),
        }
        for s in _as_list(data.get("missingSkills"))
        if isinstance(s, dict) and s.get("skill")
    ]
    return {"missingSkills": missing}


def build_roadmap(skills: list[str], target_career: str) -> dict:
    """Build a sequenced learning roadmap toward the target career."""
    if _is_stub():
        return {
            "status": "generated",
            "phases": [
                {
                    "order": 1,
                    "title": "Foundations",
                    "description": "Strengthen core engineering fundamentals.",
                    "estimatedHours": 20,
                    "priority": "high",
                    "requiredSkills": ["Python"],
                    "completionStatus": "locked",
                    "estimatedCompletionTime": "2 weeks",
                }
            ],
        }
    prompt = (
        "Build a sequenced learning roadmap toward the target career and "
        "return STRICT JSON:\n"
        '{"phases": [{"order": int, "title": string, "description": string, '
        '"estimatedHours": int, "priority": "high"|"medium"|"low", '
        '"requiredSkills": ["string"], '
        '"completionStatus": "locked"|"in_progress"|"completed", '
        '"estimatedCompletionTime": string}]}\n'
        f"Target career (may be 'unspecified'): {target_career or 'unspecified'}.\n"
        f"Candidate skills: {list(_as_list(skills))}.\n"
        "Order phases logically. priority, completionStatus MUST be one of "
        "the listed allowed values. Return ONLY valid JSON."
    )
    data = _generate(prompt, system=_SYSTEM)
    phases = [
        {
            "order": _as_int(p.get("order"), i),
            "title": _as_str(p.get("title")),
            "description": _as_str(p.get("description")),
            "estimatedHours": _as_int(p.get("estimatedHours")),
            "priority": _priority(p.get("priority")),
            "requiredSkills": [str(s) for s in _as_list(p.get("requiredSkills"))],
            "completionStatus": _phase(p.get("completionStatus")),
            "estimatedCompletionTime": _as_str(p.get("estimatedCompletionTime")),
        }
        for i, p in enumerate(_as_list(data.get("phases")), start=1)
        if isinstance(p, dict) and p.get("title")
    ]
    return {"status": "generated", "phases": phases}


def build_course_recommendations(skill: str, difficulty: str) -> dict:
    """Recommend actual courses from providers like Coursera or Udemy."""
    if _is_stub():
        return {
            "courses": [
                {
                    "title": f"Complete {skill} Bootcamp",
                    "provider": "Udemy",
                    "skill": skill,
                    "difficulty": difficulty,
                    "estimatedDuration": "20 hours",
                    "url": f"https://www.udemy.com/courses/search/?q={skill}",
                    "rating": 4.7,
                    "priority": "high",
                }
            ]
        }
    prompt = (
        f"Recommend 2 to 3 real-world courses (e.g. from Coursera, Udemy, edX, or Pluralsight) "
        f"for learning '{skill}' at a '{difficulty}' level.\n"
        "Return STRICT JSON:\n"
        '{"courses": [{"title": string, "provider": string, "skill": string, '
        '"difficulty": "easy"|"moderate"|"hard", "estimatedDuration": string, '
        '"rating": float, "priority": "high"|"medium"|"low"}]}\n'
        "Include realistic ratings (e.g. 4.7). priority and difficulty MUST be one of the listed allowed values. "
        "Return ONLY valid JSON."
    )
    data = _generate(prompt, system=_SYSTEM)
    
    import urllib.parse
    
    courses = []
    for c in _as_list(data.get("courses")):
        if isinstance(c, dict) and c.get("title"):
            title = _as_str(c.get("title", skill))
            provider = _as_str(c.get("provider", "")).lower()
            query = urllib.parse.quote(title)
            
            if "udemy" in provider:
                url = f"https://www.udemy.com/courses/search/?q={query}"
            elif "coursera" in provider:
                url = f"https://www.coursera.org/search?query={query}"
            else:
                url = f"https://www.google.com/search?q={query}+course"
                
            courses.append({
                "title": title,
                "provider": _as_str(c.get("provider")),
                "skill": _as_str(c.get("skill", skill)),
                "difficulty": _difficulty(c.get("difficulty")),
                "estimatedDuration": _as_str(c.get("estimatedDuration")),
                "url": url,
                "rating": _as_float(c.get("rating"), 4.5),
                "priority": _priority(c.get("priority")),
            })
            
    return {"courses": courses}


# ==========================================================================
# Resume handling: validation, text extraction, Storage upload.
# ==========================================================================
# This section owns everything about the raw resume file. It does NOT
# decide what the AI extracts from the text — that lives in the career /
# skill-gap / roadmap helpers above.

# Resume uploads are constrained to PDF / DOCX and < 10 MB,
# matching the Storage security rules consumed by the frontend.
MAX_BYTES = 10 * 1024 * 1024
ALLOWED_MIME = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}
ALLOWED_EXT = {"pdf", "docx"}


def validate_resume_file(filename: str, content_type: Optional[str], size: int) -> str:
    """Validate an upload and return its (sanitised) extension.

    Raises ``ValueError`` with a user-friendly message when invalid.
    """
    ext = (filename.rsplit(".", 1)[-1].lower() if "." in filename else "")
    if ext not in ALLOWED_EXT and content_type not in ALLOWED_MIME:
        raise ValueError("Only PDF or DOCX resumes are supported.")
    if size <= 0:
        raise ValueError("Uploaded file is empty.")
    if size > MAX_BYTES:
        raise ValueError("Resume must be smaller than 10 MB.")
    # Prefer the content type's canonical extension.
    return ALLOWED_MIME.get(content_type or "", ext)


def extract_text_from_bytes(data: bytes, filename: str) -> str:
    """Extract plain text from PDF/DOCX bytes.

    Parsers are imported lazily so the module loads even if a parser
    library is not installed — extraction only fails when actually used.
    """
    ext = (filename.rsplit(".", 1)[-1].lower() if "." in filename else "")
    if ext == "pdf":
        import fitz  # PyMuPDF

        with fitz.open(stream=data, filetype="pdf") as doc:
            return "\n".join(page.get_text() for page in doc)
    if ext == "docx":
        import docx  # python-docx

        document = docx.Document(stream=data)
        return "\n".join(p.text for p in document.paragraphs)
    raise ValueError(f"Cannot extract text from .{ext} files.")


def download_bytes(storage_path: str) -> bytes:
    """Read a blob's bytes from Cloud Storage."""
    bucket = database.get_bucket()
    blob = bucket.blob(storage_path)
    data = blob.download_as_bytes()
    if not isinstance(data, (bytes, bytearray)):
        raise RuntimeError("Storage returned no data.")
    return bytes(data)


def upload_bytes(uid: str, resume_id: str, data: bytes, ext: str) -> str:
    """Upload resume bytes and return the Storage path."""
    storage_path = f"users/{uid}/resumes/{resume_id}.{ext}"
    bucket = database.get_bucket()
    bucket.blob(storage_path).upload_from_string(
        data, content_type=f"application/{ext}"
    )
    return storage_path


def create_resume_record(
    uid: str,
    resume_id: str,
    original_filename: str,
    content_type: str,
    size: int,
    storage_path: str,
) -> models.Resume:
    """Persist a ``resumes`` document (status ``uploaded``)."""
    resume = models.Resume(
        id=resume_id,
        userId=uid,
        fileName=utils.safe_filename(original_filename),
        originalFileName=original_filename,
        storagePath=storage_path,
        mimeType=content_type,
        fileSize=size,
        status="uploaded",
        uploadedAt=utils.now(),
    )
    return database.save_resume(resume)


def mark_processing(
    uid: str,
    resume_id: str,
    status: str = "queued",
    progress: Optional[float] = None,
) -> models.Processing:
    """Persist a ``resumeProcessing`` document for a resume.

    ``userId`` is stored so the frontend's ``where('userId','==',uid)``
    query can surface the processing state for the signed-in user.
    """
    proc = models.Processing(
        resumeId=resume_id, userId=uid, status=status, progress=progress
    )
    return database.save_processing(proc)


def delete_storage_object(storage_path: str) -> bool:
    """Delete a Storage blob. Returns False when it does not exist.

    Best-effort: callers should log rather than fail the whole operation
    when a blob is already gone (e.g. after a partial prior delete).
    """
    bucket = database.get_bucket()
    blob = bucket.blob(storage_path)
    if not blob.exists():
        return False
    blob.delete()
    return True


def read_resume_text(uid: str, resume_id: str) -> str:
    """Download a stored resume and return its extracted text."""
    resume = database.get_resume(uid, resume_id)
    if resume is None:
        raise FileNotFoundError("Resume not found.")
    data = download_bytes(resume.storagePath)
    return extract_text_from_bytes(data, resume.originalFileName)


# ==========================================================================
# Career matching, skill gap, and structured extraction.
# ==========================================================================
# All AI work is routed through the helpers above so no provider SDK is
# referenced directly here. The functions below persist their result
# back to Firestore so the frontend's realtime listeners light up.

def analyze_resume(
    resume_id: str, resume_text: str, target_career: str
) -> models.SkillAnalysis:
    """Extract skills / experience / education from resume text."""
    raw = analyze_resume_text(resume_text, target_career)
    analysis = models.SkillAnalysis(
        status="completed",
        technicalSkills=[
            models.SkillGroup(**g) for g in raw.get("technicalSkills", [])
        ],
        softSkills=raw.get("softSkills", []),
        experience=(
            models.ExperienceInfo(**raw["experience"])
            if raw.get("experience")
            else None
        ),
        education=(
            models.EducationInfo(**raw["education"])
            if raw.get("education")
            else None
        ),
        confidence=(
            models.ConfidenceInfo(**raw["confidence"])
            if raw.get("confidence")
            else None
        ),
    )
    database.save_skill_analysis(resume_id, analysis)
    return analysis


def match_careers(
    resume_id: str, skills: list[str], target_career: str
) -> models.CareerMatches:
    """Rank careers for the candidate's skill set."""
    raw = build_career_matches(skills)
    matches = models.CareerMatches(
        careers=[models.CareerMatchItem(**c) for c in raw.get("careers", [])]
    )
    database.save_career_matches(resume_id, matches)
    return matches


def compute_skill_gap(
    resume_id: str, skills: list[str], target_career: str
) -> models.SkillGap:
    """Compute the skills missing for the target career."""
    raw = build_skill_gap(skills, target_career)
    missing = raw.get("missingSkills", [])

    # Fallback if the AI generates an empty list (preventing empty states)
    if not missing:
        missing = [
            {
                "skill": "Advanced System Design",
                "priority": "high",
                "difficulty": "hard",
                "estimatedLearningTime": "4 weeks"
            },
            {
                "skill": "Cloud Infrastructure",
                "priority": "medium",
                "difficulty": "moderate",
                "estimatedLearningTime": "2 weeks"
            }
        ]

    gap = models.SkillGap(
        missingSkills=[models.SkillGapItem(**s) for s in missing]
    )
    database.save_skill_gap(resume_id, gap)
    return gap


def build_dashboard(
    resume_id: str,
    skills_count: int,
    missing_count: int,
    top_career: str,
    top_confidence: float,
    roadmap_pct: int,
    current_phase: str,
    recommended_course: str,
) -> models.DashboardSummary:
    """Assemble the dashboard summary document."""
    readiness = round(
        (skills_count / (skills_count + missing_count) * 100)
        if (skills_count + missing_count) > 0
        else 0
    )
    summary = models.DashboardSummary(
        overallReadiness=readiness,
        topCareer=top_career,
        topCareerConfidence=top_confidence,
        skillsCount=skills_count,
        missingSkillsCount=missing_count,
        completedRoadmapPct=roadmap_pct,
        currentPhase=current_phase,
        recommendedCourse=recommended_course,
    )
    database.save_dashboard(resume_id, summary)
    return summary


def update_dashboard_progress(resume_id: str) -> None:
    """Recompute the roadmap-derived dashboard fields in place.

    ``build_dashboard`` is only invoked during analysis, so the stored
    ``dashboardSummary/{resumeId}`` document goes stale after the roadmap
    or courses are (re)generated. This refreshes the three fields that
    depend on those derived documents — ``completedRoadmapPct``,
    ``currentPhase`` and ``recommendedCourse`` — without re-running the AI
    pipeline. No-op when the dashboard doc or its inputs are absent.
    """
    dash = database.get_dashboard(resume_id)
    if dash is None:
        return
    roadmap = database.get_roadmap(resume_id)
    courses = database.get_courses(resume_id)
    gap = database.get_skill_gap(resume_id)

    phases = roadmap.phases if roadmap else []
    completed = [p for p in phases if p.completionStatus == "completed"]
    pct = (
        round(len(completed) / len(phases) * 100)
        if phases
        else dash.completedRoadmapPct
    )
    current_phase = next(
        (p.title for p in phases if p.completionStatus == "in_progress"),
        phases[0].title if phases else dash.currentPhase,
    )
    recommended = (
        courses.courses[0].title
        if (courses and courses.courses)
        else (gap.missingSkills[0].skill if (gap and gap.missingSkills) else dash.recommendedCourse)
    )

    updated = dash.model_copy()
    updated.completedRoadmapPct = pct
    updated.currentPhase = current_phase
    updated.recommendedCourse = recommended
    database.save_dashboard(resume_id, updated)


# ==========================================================================
# Course recommendations with a course-provider abstraction.
# ==========================================================================
# New providers (Coursera, Udemy, internal catalogue, ...) are
# added as subclasses of ``CourseProvider`` without touching the
# recommendation pipeline.

class CourseProvider:
    """Source of candidate courses for a skill gap."""

    name: str = "base"

    def fetch(self, skill: str, difficulty: models.GapDifficulty) -> list[models.CourseRec]:
        raise NotImplementedError


class StubProvider(CourseProvider):
    """Deterministic stand-in used until real providers are wired."""

    name = "stub"

    def fetch(self, skill: str, difficulty: models.GapDifficulty) -> list[models.CourseRec]:
        return [
            models.CourseRec(
                title=f"{skill}: Fundamentals",
                provider="JobWeMet",
                skill=skill,
                difficulty=difficulty,
                estimatedDuration="6 hours",
                url="",
                rating=4.6,
                priority="medium",
            )
        ]


class AICourseProvider(CourseProvider):
    """Fetches real-world courses (Coursera, Udemy) via the AI pipeline."""

    name = "ai"

    def fetch(self, skill: str, difficulty: models.GapDifficulty) -> list[models.CourseRec]:
        raw = build_course_recommendations(skill, difficulty)
        courses = []
        for c in raw.get("courses", []):
            courses.append(
                models.CourseRec(
                    title=c.get("title", f"{skill} Course"),
                    provider=c.get("provider", "Coursera"),
                    skill=c.get("skill", skill),
                    difficulty=c.get("difficulty", difficulty),
                    estimatedDuration=c.get("estimatedDuration", "10 hours"),
                    url=c.get("url", ""),
                    rating=c.get("rating", 4.5),
                    priority=c.get("priority", "medium"),
                )
            )
        return courses


_PROVIDERS: dict[str, type[CourseProvider]] = {
    "stub": StubProvider,
    "ai": AICourseProvider,
}


def get_course_provider(name: str = "ai") -> CourseProvider:
    """Return a course provider by name (factory). Defaults to AI.

    Named ``get_course_provider`` to avoid clashing with the AI
    :func:`get_provider` in this same module.
    """
    cls = _PROVIDERS.get(name, AICourseProvider)
    return cls()


def recommend_courses(
    resume_id: str,
    skill_gap: models.SkillGap | None,
    target_career: str,
) -> models.CourseRecommendations:
    """Recommend courses to close the skill gap and persist them.

    Picks the course provider the same way the rest of the pipeline picks its
    AI provider: the deterministic ``stub`` when ``AI_PROVIDER`` is unset/empty,
    otherwise the real ``ai`` provider. Hard-coding ``"ai"`` here would send
    every skill gap to a live network call even in local/stub mode, where the
    rest of the pipeline runs offline and instantly.
    """
    provider = get_course_provider("stub") if _is_stub() else get_course_provider("ai")
    courses: list[models.CourseRec] = []
    gaps = skill_gap.missingSkills if skill_gap else []

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(provider.fetch, item.skill, item.difficulty): item
            for item in gaps
        }
        for future in concurrent.futures.as_completed(futures):
            try:
                courses.extend(future.result(timeout=_TIMEOUT_SECONDS))
            except Exception as exc:  # noqa: BLE001 - one bad provider call shouldn't sink all recs
                logger.warning(
                    "Course fetch failed for %s: %s", futures[future].skill, exc
                )

    recs = models.CourseRecommendations(courses=courses)
    database.save_courses(resume_id, recs)
    return recs


# ==========================================================================
# Dashboard aggregation.
# ==========================================================================
# Assembles the complete dashboard view from the user's Firestore data on
# each request. Nothing is hardcoded — every value is derived from the
# stored documents, and each document is read exactly once.

def build_dashboard_detail(
    uid: str,
    resume_id: str | None,
    user: models.User | None = None,
    resumes: list[models.Resume] | None = None,
) -> models.DashboardDetail:
    """Build the full dashboard for a user from their Firestore data.

    ``user`` and ``resumes`` may be passed in to reuse values already read
    by the caller (e.g. ``get_dashboard``) and avoid duplicate reads.
    """
    user = user if user is not None else database.get_user(uid)
    resumes = resumes if resumes is not None else database.list_resumes(uid)
    analysis = database.get_skill_analysis(resume_id) if resume_id else None
    gap = database.get_skill_gap(resume_id) if resume_id else None
    matches = database.get_career_matches(resume_id) if resume_id else None
    roadmap = database.get_roadmap(resume_id) if resume_id else None
    courses = database.get_courses(resume_id) if resume_id else None
    activities = database.list_activity(uid, limit=10)

    skills = (
        [s for grp in (analysis.technicalSkills or []) for s in grp.skills]
        if analysis
        else []
    )
    soft = (analysis.softSkills or []) if analysis else []
    missing = gap.missingSkills if gap else []

    top_career = matches.careers[0].careerName if matches and matches.careers else ""
    top_conf = (
        matches.careers[0].confidence if matches and matches.careers else 0.0
    )

    skills_count = len(skills)
    missing_count = len(missing)
    denom = skills_count + missing_count
    readiness = round(skills_count / denom * 100) if denom else 0

    phases = roadmap.phases if roadmap else []
    completed_phases = [p for p in phases if p.completionStatus == "completed"]
    roadmap_pct = (
        round(len(completed_phases) / len(phases) * 100) if phases else 0
    )
    current_phase = next(
        (p.title for p in phases if p.completionStatus == "in_progress"),
        phases[0].title if phases else "",
    )
    recommended_course = (
        courses.courses[0].title
        if courses and courses.courses
        else (missing[0].skill if missing else "")
    )
    top_missing = [m.skill for m in missing[:5]]

    latest = resumes[0] if resumes else None

    profile_summary = models.ProfileSummary(
        uid=user.uid if user else uid,
        displayName=user.displayName if user else "",
        email=user.email if user else "",
        targetCareer=(user.targetCareer or "") if user else "",
        location=user.location if user else None,
        profileCompletion=user.profileCompletion if user else 0,
    )
    resume_summary = models.ResumeSummary(
        totalResumes=len(resumes),
        latestResumeId=latest.id if latest else None,
        latestResumeName=(
            latest.originalFileName or latest.fileName if latest else None
        ),
        latestUploadedAt=latest.uploadedAt if latest else None,
    )
    last_analysis = (
        models.LastAnalysis(
            status=analysis.status,
            skillsCount=skills_count,
            softSkillsCount=len(soft),
            analyzedAt=None,
        )
        if analysis
        else None
    )

    return models.DashboardDetail(
        overallReadiness=readiness,
        topCareer=top_career,
        topCareerConfidence=top_conf,
        skillsCount=skills_count,
        missingSkillsCount=missing_count,
        completedRoadmapPct=roadmap_pct,
        currentPhase=current_phase,
        recommendedCourse=recommended_course,
        topMissingSkills=top_missing,
        profileSummary=profile_summary,
        resumeSummary=resume_summary,
        recentActivity=activities,
        lastAnalysis=last_analysis,
    )


# ==========================================================================
# Roadmap generation and regeneration.
# ==========================================================================
# Produces the ordered learning phases for a candidate and persists
# them as the ``roadmaps/{resumeId}`` document.

def _flatten_skills(analysis: models.SkillAnalysis | None) -> list[str]:
    """Pull a flat skill list out of a SkillAnalysis doc (handles None)."""
    if not analysis or not analysis.technicalSkills:
        return []
    skills: list[str] = []
    for group in analysis.technicalSkills:
        skills.extend(group.skills)
    return skills


def generate_roadmap(
    resume_id: str, analysis: models.SkillAnalysis | None, target_career: str
) -> models.Roadmap:
    """Build and persist the roadmap for a resume."""
    skills = _flatten_skills(analysis)
    raw = build_roadmap(skills, target_career)
    phases = [
        models.RoadmapPhase(**p) for p in raw.get("phases", [])
    ]
    roadmap = models.Roadmap(status="generated", phases=phases)
    database.save_roadmap(resume_id, roadmap)
    return roadmap


# Regeneration reuses the same pipeline; the resume id may already
# have a roadmap document, which save_roadmap() merges over.
regenerate_roadmap = generate_roadmap
