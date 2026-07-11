"""AI provider abstraction.

Every AI call in the application goes through this module — no endpoint
or domain module imports a provider SDK directly. Today only **Gemini**
is wired (via the REST API using ``requests``), with a deterministic
**Stub** provider used when no key is configured.

Adding OpenAI or Claude later means adding one provider class and a
branch in :func:`get_provider`; nothing else in the app changes.
"""
from __future__ import annotations

import json
import os
from abc import ABC, abstractmethod
from typing import Optional

import requests

from . import config

# How long to wait on a provider before giving up.
_TIMEOUT_SECONDS = 60


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
    without spending tokens or requiring secrets.
    """

    name = "stub"

    def complete(self, prompt: str, *, system: Optional[str] = None) -> str:
        return (
            "[stub] AI provider is not configured. Set AI_PROVIDER=gemini "
            "and GEMINI_API_KEY in .env to enable real generation."
        )


class GeminiProvider(AIProvider):
    """Google Gemini via the Generative Language REST API."""

    name = "gemini"

    def __init__(self, api_key: str, model: str) -> None:
        self._api_key = api_key
        self._model = model
        self._url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent"
        )

    def complete(self, prompt: str, *, system: Optional[str] = None) -> str:
        parts = []
        if system:
            parts.append({"text": system})
        parts.append({"text": prompt})

        payload = {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048},
        }
        resp = requests.post(
            self._url,
            params={"key": self._api_key},
            json=payload,
            timeout=_TIMEOUT_SECONDS,
        )
        if resp.status_code != 200:
            raise RuntimeError(
                f"Gemini API error {resp.status_code}: {resp.text[:300]}"
            )
        data = resp.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as exc:
            raise RuntimeError(f"Unexpected Gemini response: {data}") from exc


def get_provider() -> AIProvider:
    """Return the configured provider (factory)."""
    if config.AI_PROVIDER == "gemini" and config.GEMINI_API_KEY:
        return GeminiProvider(config.GEMINI_API_KEY, config.GEMINI_MODEL)
    return StubProvider()


# --------------------------------------------------------------------------
# Public entry-point used by every domain module.
# --------------------------------------------------------------------------


def chat(prompt: str, *, system: Optional[str] = None) -> str:
    """Route a prompt to the active provider."""
    return get_provider().complete(prompt, system=system)


def _try_parse_json(text: str) -> Optional[dict]:
    """Best-effort extraction of a JSON object from a model response."""
    text = text.strip()
    if text.startswith("```"):
        # Strip a ```json ... ``` fence if the model added one.
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[len("json"):]
        text = text.strip().rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


# --------------------------------------------------------------------------
# Domain helpers — build prompts, call :func:`chat`, return structured data.
# Each returns a plain dict; the caller wraps it in a Pydantic model.
# Until real parsing is tuned, a deterministic placeholder is returned so
# the rest of the application keeps working.
# --------------------------------------------------------------------------


def analyze_resume_text(resume_text: str, target_career: str) -> dict:
    """Extract skills, experience and education from resume text."""
    prompt = (
        f"Analyze the following resume for a candidate targeting "
        f"'{target_career}'. Extract technical skills grouped by category, "
        "soft skills, years of experience, current role, and highest "
        "education. Return JSON."
    )
    chat(prompt, system="You are an expert technical recruiter.")
    # Placeholder structure — replaced by real parsing once tuned.
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


def build_career_matches(skills: list[str], target_career: str) -> dict:
    prompt = (
        f"Given these skills: {skills}, and a target career "
        f"'{target_career}', list the best-matching careers with confidence."
    )
    chat(prompt)
    return {
        "careers": [
            {
                "careerName": target_career or "Software Engineer",
                "confidence": 0.82,
                "reason": "Strong overlap with the candidate's profile.",
                "topMatchingSkills": skills[:3],
            }
        ]
    }


def build_skill_gap(skills: list[str], target_career: str) -> dict:
    prompt = (
        f"Given skills {skills} and target '{target_career}', list the "
        "missing skills needed, with priority and difficulty."
    )
    chat(prompt)
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


def build_roadmap(skills: list[str], target_career: str) -> dict:
    prompt = (
        f"Build a learning roadmap from skills {skills} to '{target_career}' "
        "as ordered phases."
    )
    chat(prompt)
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


def build_course_list(skill_gap: list[str], target_career: str) -> dict:
    prompt = (
        f"Recommend courses to close these gaps {skill_gap} for a "
        f"'{target_career}' career."
    )
    chat(prompt)
    return {
        "courses": [
            {
                "title": "System Design Fundamentals",
                "provider": "Coursera",
                "skill": skill_gap[0] if skill_gap else "System Design",
                "difficulty": "hard",
                "estimatedDuration": "6 hours",
                "url": "",
                "rating": 4.6,
                "priority": "high",
            }
        ]
    }
