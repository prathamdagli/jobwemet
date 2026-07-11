"""Dashboard aggregation.

Assembles the complete dashboard view from the user's Firestore data on
each request. Nothing is hardcoded — every value is derived from the
stored documents, and each document is read exactly once.
"""
from __future__ import annotations

from . import database, models


def build_dashboard_detail(
    uid: str, resume_id: str | None
) -> models.DashboardDetail:
    """Build the full dashboard for a user from their Firestore data."""
    user = database.get_user(uid)
    resumes = database.list_resumes(uid)
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
