"""AI provider abstraction.

Every AI call in the application goes through this module — no endpoint
or domain module imports a provider SDK directly. Today a deterministic
``stub`` provider is used when no real key is configured; otherwise the
configured provider (OpenRouter) is used for the four generative stages of
the resume pipeline: skill extraction, career matching, skill-gap analysis
and roadmap generation. (Course recommendations are catalog-driven and live
in ``courses.py`` by design, not here.)

Adding another provider later means adding one provider class and a branch
in :func:`get_provider`; nothing else in the app changes.
"""
from __future__ import annotations

import json
import logging
import re
import time
from abc import ABC, abstractmethod
from typing import Optional

import requests

from . import config

logger = logging.getLogger(__name__)

# How long to wait on a provider before giving up.
_TIMEOUT_SECONDS = 30

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
    fallback only — production runs the OpenRouter provider.
    """

    name = "stub"

    def complete(self, prompt: str, *, system: Optional[str] = None) -> str:
        return (
            "[stub] AI provider is not configured. Set AI_PROVIDER=openrouter "
            "and OPENROUTER_API_KEY in .env to enable real generation."
        )


class OpenRouterProvider(AIProvider):
    """OpenRouter chat-completions API (OpenAI-compatible)."""

    name = "openrouter"

    # Valid OpenRouter reasoning-effort levels. Unknown/empty values are
    # skipped so non-reasoning models and typos degrade gracefully.
    _REASONING_EFFORTS = {"max", "xhigh", "high", "medium", "low", "minimal", "none"}

    def __init__(self, api_key: str, base_url: str, model: str, reasoning: str = "low") -> None:
        self._api_key = api_key
        self._model = model
        self._reasoning = reasoning
        self._url = f"{base_url.rstrip('/')}/chat/completions"

    def complete(self, prompt: str, *, system: Optional[str] = None) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self._model,
            "messages": messages,
            "temperature": 0.2,
        }
        # Optional reasoning effort for models that support it. Sent only for
        # a recognised effort level; otherwise omitted so the request still
        # works (graceful default) on models that don't use it.
        effort = (self._reasoning or "").strip().lower()
        if effort in self._REASONING_EFFORTS:
            payload["reasoning"] = {"effort": effort}
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        started = time.monotonic()
        try:
            resp = requests.post(
                self._url,
                headers=headers,
                json=payload,
                timeout=_TIMEOUT_SECONDS,
            )
        except requests.exceptions.Timeout:
            raise AIError(
                "The AI provider timed out.", status_code=504, code="ai_timeout"
            )
        except requests.exceptions.RequestException as exc:
            raise AIError(
                f"The AI provider is unreachable: {exc}",
                status_code=502,
                code="ai_unavailable",
            )

        latency_ms = int((time.monotonic() - started) * 1000)
        request_id = resp.headers.get("x-request-id")
        try:
            usage = resp.json().get("usage")
        except Exception:
            usage = None
        # Log operational signal only — never the prompt or the API key.
        logger.info(
            "openrouter model=%s latency_ms=%d request_id=%s usage=%s",
            self._model,
            latency_ms,
            request_id,
            usage,
        )

        # Map the documented status codes onto stable error envelopes.
        if resp.status_code in (401, 403):
            raise AIError(
                "Invalid or unauthorized OpenRouter API key.",
                status_code=401,
                code="ai_auth",
            )
        if resp.status_code == 404:
            raise AIError(
                "OpenRouter model or endpoint not found.",
                status_code=404,
                code="ai_not_found",
            )
        if resp.status_code == 408:
            raise AIError(
                "The AI provider request timed out.",
                status_code=408,
                code="ai_timeout",
            )
        if resp.status_code == 429:
            raise AIError(
                "AI provider quota exceeded. Check the OpenRouter key's "
                "credits / rate limits, then retry. Raw: "
                f"{resp.text[:300]}",
                status_code=429,
                code="ai_quota",
            )
        if resp.status_code == 503:
            raise AIError(
                "The AI provider is temporarily unavailable.",
                status_code=503,
                code="ai_unavailable",
            )
        if resp.status_code == 504:
            raise AIError(
                "The AI provider gateway timed out.",
                status_code=504,
                code="ai_timeout",
            )
        if resp.status_code >= 500:
            raise AIError(
                f"OpenRouter API error {resp.status_code}: {resp.text[:300]}",
                status_code=502,
                code="ai_error",
            )
        if resp.status_code != 200:
            raise AIError(
                f"OpenRouter API error {resp.status_code}: {resp.text[:300]}",
                status_code=502,
                code="ai_error",
            )

        try:
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, ValueError) as exc:
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
    if config.AI_PROVIDER == "openrouter" and config.OPENROUTER_API_KEY:
        return OpenRouterProvider(
            config.OPENROUTER_API_KEY,
            config.OPENROUTER_BASE_URL,
            config.OPENROUTER_MODEL,
            config.OPENROUTER_REASONING,
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
# OpenRouter provider is active the dict is produced by a real generation
# call; when only the stub is configured a deterministic placeholder is
# returned (intentional fallback, never billed).
# --------------------------------------------------------------------------


def analyze_resume_text(resume_text: str, target_career: str) -> dict:
    """Extract skills, experience and education from resume text."""
    if _is_stub():
        return {
            "status": "completed",
            "technicalSkills": [
                {"category": "Programming", "skills": ["Python", "SQL"]}
            ],
            "softSkills": ["Communication", "Problem Solving"],
            "experience": {
                "years": 2,
                "currentRole": "Junior Developer",
                "previousRoles": [],
                "projects": [],
            },
            "education": {"highestQualification": "Bachelor's"},
            "confidence": {"overall": 70, "skills": 70, "careerMatch": 65},
        }
    prompt = (
        "Analyse the resume text below and return STRICT JSON with this exact "
        "shape:\n"
        "{\n"
        '  "technicalSkills": [{"category": "string", "skills": ["string"]}],\n'
        '  "softSkills": ["string"],\n'
        '  "experience": {"years": int, "currentRole": "string", '
        '"previousRoles": ["string"], "projects": ["string"]},\n'
        '  "education": {"highestQualification": "string"},\n'
        '  "confidence": {"overall": 0-100, "skills": 0-100, "careerMatch": 0-100}\n'
        "}\n"
        f"Target career (may be 'unspecified'): {target_career or 'unspecified'}.\n"
        "Use real numbers for confidence (0-100). Return ONLY valid JSON. Resume text:\n\"\"\"\n"
        + (resume_text or "")[:12000]
        + "\n\"\"\""
    )
    data = _generate(prompt, system=_SYSTEM)
    groups = [
        {"category": _as_str(g.get("category")),
         "skills": [str(s) for s in _as_list(g.get("skills"))]}
        for g in _as_list(data.get("technicalSkills"))
        if isinstance(g, dict) and g.get("category")
    ]
    confidence = data.get("confidence") or {}
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
        "confidence": {
            "overall": _as_float(confidence.get("overall")),
            "skills": _as_float(confidence.get("skills")),
            "careerMatch": _as_float(confidence.get("careerMatch")),
        },
    }


def build_career_matches(skills: list[str], target_career: str) -> dict:
    """Rank careers that fit the candidate's skill set."""
    if _is_stub():
        return {
            "careers": [
                {
                    "careerName": target_career or "Software Engineer",
                    "confidence": 0.82,
                    "reason": "Strong overlap with the candidate's profile.",
                    "topMatchingSkills": _as_list(skills)[:3],
                }
            ]
        }
    prompt = (
        "Given the candidate's skills, rank the best-fit careers for the "
        "target career and return STRICT JSON:\n"
        '{"careers": [{"careerName": string, "confidence": 0-1 float, '
        '"reason": string, "topMatchingSkills": ["string"]}]}\n'
        f"Target career (may be 'unspecified'): {target_career or 'unspecified'}.\n"
        f"Candidate skills: {list(_as_list(skills))}.\n"
        "Include 3-6 careers. confidence must be a float between 0 and 1. "
        "Return ONLY valid JSON."
    )
    data = _generate(prompt, system=_SYSTEM)
    careers = [
        {
            "careerName": _as_str(c.get("careerName")),
            "confidence": max(0.0, min(1.0, _as_float(c.get("confidence"), 0.5))),
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
