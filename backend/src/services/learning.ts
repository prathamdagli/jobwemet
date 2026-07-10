import { FieldValue, type DocumentData, type UpdateData } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

import { db } from '../config/admin';
import { getAIService } from './ai';
import { withRetry } from '../utils/retry';
import type {
  AnalysisStatus,
  CareerMatch,
  ConfidenceInfo,
  CourseRecommendation,
  DashboardInput,
  DashboardSummary,
  RoadmapPhase,
  SkillGapItem,
  SkillGroup,
} from '../types';

const AI_TIMEOUT_MS = 60_000;
const SKILL_ANALYSIS = 'skillAnalysis';
const ROADMAPS = 'roadmaps';
const COURSE_RECOMMENDATIONS = 'courseRecommendations';
const DASHBOARD_SUMMARY = 'dashboardSummary';

/** Shape we need from the skillAnalysis control document. */
interface AnalysisSnapshot {
  userId: string;
  status: AnalysisStatus;
  careers: CareerMatch[];
  missingSkills: SkillGapItem[];
  confidence: ConfidenceInfo;
  technicalSkills: SkillGroup[];
  softSkills: string[];
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function ts(): FirebaseFirestore.FieldValue {
  return FieldValue.serverTimestamp();
}

/** Read the analysis control doc, or null if missing. */
async function getAnalysis(resumeId: string): Promise<AnalysisSnapshot | null> {
  const snap = await db.collection(SKILL_ANALYSIS).doc(resumeId).get();
  if (!snap.exists) return null;
  return snap.data() as AnalysisSnapshot;
}

/** Mark a learning-stage doc failed, creating it if it does not exist yet. */
async function markFailed(
  collection: string,
  resumeId: string,
  userId: string,
  error: string,
): Promise<void> {
  const ref = db.collection(collection).doc(resumeId);
  const snap = await ref.get();
  const data = { status: 'failed' as const, error, updatedAt: ts() };
  if (snap.exists) {
    await ref.update(data as UpdateData<DocumentData>);
  } else {
    await ref.set({ userId, resumeId, generatedAt: ts(), ...data });
  }
}

/**
 * Generate + store the learning roadmap. Throws after AI + write retries are
 * exhausted so the caller can log; the doc is left in a failed state and the
 * rest of the pipeline continues.
 */
async function generateRoadmapStage(
  userId: string,
  resumeId: string,
  ai: ReturnType<typeof getAIService>,
  careerName: string,
  missingSkills: SkillGapItem[],
): Promise<RoadmapPhase[]> {
  const ref = db.collection(ROADMAPS).doc(resumeId);
  await withRetry(() =>
    ref.set({ userId, resumeId, generatedAt: ts(), status: 'processing', error: '' }),
  );

  let phases: RoadmapPhase[];
  try {
    phases = await withRetry(
      () => ai.generateRoadmap(careerName, missingSkills),
      1,
      AI_TIMEOUT_MS,
    );
  } catch (err) {
    await markFailed(ROADMAPS, resumeId, userId, errMsg(err));
    throw err;
  }

  await withRetry(() =>
    ref.update({
      status: 'completed',
      error: '',
      phases,
      updatedAt: ts(),
    } as UpdateData<DocumentData>),
  );
  return phases;
}

/** Generate + store course recommendations for every missing skill. */
async function generateCoursesStage(
  userId: string,
  resumeId: string,
  ai: ReturnType<typeof getAIService>,
  missingSkills: SkillGapItem[],
): Promise<CourseRecommendation[]> {
  const ref = db.collection(COURSE_RECOMMENDATIONS).doc(resumeId);
  await withRetry(() =>
    ref.set({ userId, resumeId, generatedAt: ts(), status: 'processing', error: '' }),
  );

  let courses: CourseRecommendation[];
  try {
    courses = await withRetry(
      () => ai.recommendCourses(missingSkills),
      1,
      AI_TIMEOUT_MS,
    );
  } catch (err) {
    await markFailed(COURSE_RECOMMENDATIONS, resumeId, userId, errMsg(err));
    throw err;
  }

  await withRetry(() =>
    ref.update({
      status: 'completed',
      error: '',
      courses,
      updatedAt: ts(),
    } as UpdateData<DocumentData>),
  );
  return courses;
}

/** Aggregate analysis + roadmap + courses into the dashboard summary doc. */
async function generateDashboardStage(
  userId: string,
  resumeId: string,
  ai: ReturnType<typeof getAIService>,
  analysis: AnalysisSnapshot,
  phases: RoadmapPhase[],
  courses: CourseRecommendation[],
): Promise<void> {
  const ref = db.collection(DASHBOARD_SUMMARY).doc(resumeId);
  await withRetry(() =>
    ref.set({ userId, resumeId, generatedAt: ts(), status: 'processing', error: '' }),
  );

  const techCount = analysis.technicalSkills.reduce((n, g) => n + g.skills.length, 0);
  const input: DashboardInput = {
    overallReadiness: analysis.confidence?.overall ?? 0,
    topCareer: analysis.careers[0]?.careerName ?? '',
    topCareerConfidence: analysis.careers[0]?.confidence ?? 0,
    skillsCount: techCount + (analysis.softSkills?.length ?? 0),
    missingSkillsCount: analysis.missingSkills?.length ?? 0,
    phases,
    recommendedCourseTitle: courses[0]?.title ?? '',
  };

  let summary: DashboardSummary;
  try {
    summary = await withRetry(
      () => ai.generateDashboardSummary(input),
      1,
      AI_TIMEOUT_MS,
    );
  } catch (err) {
    await markFailed(DASHBOARD_SUMMARY, resumeId, userId, errMsg(err));
    throw err;
  }

  await withRetry(() =>
    ref.update({
      overallReadiness: summary.overallReadiness,
      topCareer: summary.topCareer,
      topCareerConfidence: summary.topCareerConfidence,
      skillsCount: summary.skillsCount,
      missingSkillsCount: summary.missingSkillsCount,
      completedRoadmapPct: summary.completedRoadmapPct,
      currentPhase: summary.currentPhase,
      recommendedCourse: summary.recommendedCourse,
      status: 'completed',
      error: '',
      lastUpdated: ts(),
    } as UpdateData<DocumentData>),
  );
}

/**
 * Run the Learning Pipeline after AI analysis completes. Stages (roadmap,
 * courses, dashboard) run independently: a failure in one is logged and the
 * doc marked failed, but the other stages still run.
 */
export async function runLearningPipeline(resumeId: string): Promise<void> {
  const ai = getAIService();
  try {
    const analysis = await getAnalysis(resumeId);
    if (!analysis || analysis.status !== 'completed') {
      logger.error(`Learning pipeline skipped for ${resumeId}: analysis not completed`);
      return;
    }

    const hasCareers = analysis.careers && analysis.careers.length > 0;
    const hasSkills =
      (analysis.technicalSkills?.length ?? 0) + (analysis.softSkills?.length ?? 0) > 0;
    const hasGap = analysis.missingSkills && analysis.missingSkills.length > 0;
    if (!hasCareers && !hasSkills && !hasGap) {
      logger.warn(`Learning pipeline skipped for ${resumeId}: empty analysis`);
      return;
    }

    const userId = analysis.userId;
    const topCareerName = analysis.careers[0]?.careerName ?? '';

    logger.info(`Roadmap generation started for ${resumeId}`);

    // Stage 1 — Roadmap (needs a career match).
    let phases: RoadmapPhase[] = [];
    try {
      if (!topCareerName) throw new Error('Missing career matches');
      phases = await generateRoadmapStage(
        userId,
        resumeId,
        ai,
        topCareerName,
        analysis.missingSkills,
      );
      logger.info(`Roadmap completed for ${resumeId} (${phases.length} phases)`);
    } catch (err) {
      logger.error(`Roadmap generation failed for ${resumeId}: ${errMsg(err)}`);
    }

    // Stage 2 — Course recommendations (one per missing skill).
    let courses: CourseRecommendation[] = [];
    try {
      courses = await generateCoursesStage(userId, resumeId, ai, analysis.missingSkills);
      logger.info(`Course recommendation completed for ${resumeId} (${courses.length} courses)`);
    } catch (err) {
      logger.error(`Course recommendation failed for ${resumeId}: ${errMsg(err)}`);
    }

    // Stage 3 — Dashboard summary (aggregates the two stages above).
    try {
      await generateDashboardStage(userId, resumeId, ai, analysis, phases, courses);
      logger.info(`Dashboard summary updated for ${resumeId}`);
    } catch (err) {
      logger.error(`Dashboard summary failed for ${resumeId}: ${errMsg(err)}`);
    }
  } catch (err) {
    logger.error(`Unexpected learning pipeline error for ${resumeId}: ${errMsg(err)}`, err);
  }
}
