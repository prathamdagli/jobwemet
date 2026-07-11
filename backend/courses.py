"""Course recommendations with a course-provider abstraction.

New providers (Coursera, Udemy, internal catalogue, ...) are
added as subclasses of ``CourseProvider`` without touching the
recommendation pipeline.
"""
from __future__ import annotations

from . import database, models
from .models import GapDifficulty


class CourseProvider:
    """Source of candidate courses for a skill gap."""

    name: str = "base"

    def fetch(self, skill: str, difficulty: GapDifficulty) -> list[models.CourseRec]:
        raise NotImplementedError


class StubProvider(CourseProvider):
    """Deterministic stand-in used until real providers are wired."""

    name = "stub"

    def fetch(self, skill: str, difficulty: GapDifficulty) -> list[models.CourseRec]:
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


_PROVIDERS: dict[str, type[CourseProvider]] = {
    "stub": StubProvider,
}


def get_provider(name: str = "stub") -> CourseProvider:
    """Return a course provider by name (factory)."""
    cls = _PROVIDERS.get(name, StubProvider)
    return cls()


def recommend_courses(
    resume_id: str,
    skill_gap: models.SkillGap | None,
    target_career: str,
) -> models.CourseRecommendations:
    """Recommend courses to close the skill gap and persist them."""
    provider = get_provider("stub")
    courses: list[models.CourseRec] = []
    gaps = skill_gap.missingSkills if skill_gap else []
    for item in gaps:
        courses.extend(provider.fetch(item.skill, item.difficulty))

    recs = models.CourseRecommendations(courses=courses)
    database.save_courses(resume_id, recs)
    return recs
