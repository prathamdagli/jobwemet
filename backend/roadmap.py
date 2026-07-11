"""Roadmap generation and regeneration.

Produces the ordered learning phases for a candidate and persists
them as the ``roadmaps/{resumeId}`` document.
"""
from __future__ import annotations

from . import ai, database, models


def _flatten_skills(analysis: models.SkillAnalysis | None) -> list[str]:
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
    raw = ai.build_roadmap(skills, target_career)
    phases = [
        models.RoadmapPhase(**p) for p in raw.get("phases", [])
    ]
    roadmap = models.Roadmap(status="generated", phases=phases)
    database.save_roadmap(resume_id, roadmap)
    return roadmap


# Regeneration reuses the same pipeline; the resume id may already
# have a roadmap document, which save_roadmap() merges over.
regenerate_roadmap = generate_roadmap
