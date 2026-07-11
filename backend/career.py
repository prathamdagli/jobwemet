"""Career matching, skill gap, and structured extraction.

All AI work is routed through :mod:`ai` so no provider SDK is
referenced directly here. The functions below persist their result
back to Firestore so the frontend's realtime listeners light up.
"""
from __future__ import annotations

from . import ai, database, models
from .utils import now


def analyze_resume(
    resume_id: str, resume_text: str, target_career: str
) -> models.SkillAnalysis:
    """Extract skills / experience / education from resume text."""
    raw = ai.analyze_resume_text(resume_text, target_career)
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
    raw = ai.build_career_matches(skills, target_career)
    matches = models.CareerMatches(
        careers=[models.CareerMatchItem(**c) for c in raw.get("careers", [])]
    )
    database.save_career_matches(resume_id, matches)
    return matches


def compute_skill_gap(
    resume_id: str, skills: list[str], target_career: str
) -> models.SkillGap:
    """Compute the skills missing for the target career."""
    raw = ai.build_skill_gap(skills, target_career)
    gap = models.SkillGap(
        missingSkills=[models.SkillGapItem(**s) for s in raw.get("missingSkills", [])]
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
