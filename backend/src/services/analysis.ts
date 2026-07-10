import { FieldValue, type DocumentData, type UpdateData } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

import { db } from '../config/admin';
import { getProcessingRecord } from './processing';
import { getUserProfile } from './userProfile';
import { getAIService } from './ai';
import { withRetry } from '../utils/retry';
import type { ResumeAnalysis } from '../types';

const AI_TIMEOUT_MS = 60_000;
const MIN_RAW_TEXT = 30;
const SKILL_ANALYSIS = 'skillAnalysis';
const CAREER_MATCHES = 'careerMatches';
const SKILL_GAP = 'skillGap';

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Run the AI analysis for a completed resume. Never throws. */
export async function runAnalysis(resumeId: string): Promise<void> {
  const ai = getAIService();
  try {
    const proc = await getProcessingRecord(resumeId);
    if (!proc || proc.status !== 'completed') {
      logger.error(`Analysis skipped for ${resumeId}: processing not completed`);
      return;
    }

    const rawText = proc.rawText ?? '';
    if (rawText.trim().length < MIN_RAW_TEXT) {
      logger.warn(`Analysis failed for ${resumeId}: raw text empty or too short`);
      await markFailed(resumeId, proc.userId, 'Resume text is empty or too short');
      return;
    }

    const user = await getUserProfile(proc.userId);
    if (!user) {
      logger.error(`Analysis failed for ${resumeId}: user ${proc.userId} not found`);
      await markFailed(resumeId, proc.userId, 'User profile not found');
      return;
    }

    // Control record so we can mark failure / completed.
    await db.collection(SKILL_ANALYSIS).doc(resumeId).set({
      userId: proc.userId,
      resumeId,
      generatedAt: FieldValue.serverTimestamp(),
      status: 'processing',
      error: '',
    });
    logger.info(`Analysis started for ${resumeId}`);

    let analysis: ResumeAnalysis;
    try {
      analysis = await withRetry(() => ai.analyzeResume(rawText), 1, AI_TIMEOUT_MS);
    } catch (err) {
      const msg = errMsg(err);
      logger.error(`Analysis failed for ${resumeId}: ${msg}`, err);
      await markFailed(resumeId, proc.userId, `AI analysis failed: ${msg}`);
      return;
    }

    const techCount = analysis.technicalSkills.reduce((n, g) => n + g.skills.length, 0);
    logger.info(
      `Skills extracted for ${resumeId} (${techCount} technical, ${analysis.softSkills.length} soft)`,
    );

    await db
      .collection(SKILL_ANALYSIS)
      .doc(resumeId)
      .update({
        status: 'completed',
        error: '',
        technicalSkills: analysis.technicalSkills,
        softSkills: analysis.softSkills,
        experience: analysis.experience,
        education: analysis.education,
        confidence: analysis.confidence,
        updatedAt: FieldValue.serverTimestamp(),
      } as UpdateData<DocumentData>);
    logger.info(`Career matching completed for ${resumeId} (${analysis.careers.length} careers)`);
    logger.info(`Skill gap completed for ${resumeId} (${analysis.missingSkills.length} missing)`);

    await db.collection(CAREER_MATCHES).doc(resumeId).set({
      userId: proc.userId,
      resumeId,
      generatedAt: FieldValue.serverTimestamp(),
      careers: analysis.careers,
    });
    await db.collection(SKILL_GAP).doc(resumeId).set({
      userId: proc.userId,
      resumeId,
      generatedAt: FieldValue.serverTimestamp(),
      missingSkills: analysis.missingSkills,
    });
    logger.info(`Firestore updated for ${resumeId}`);
  } catch (err) {
    const msg = errMsg(err);
    logger.error(`Unexpected analysis error for ${resumeId}: ${msg}`, err);
    try {
      await markFailed(resumeId, '', `Unexpected error: ${msg}`);
    } catch (e2) {
      logger.error(`Could not record analysis failure for ${resumeId}`, e2);
    }
  }
}

/** Mark the analysis failed, creating the record if it does not exist yet. */
async function markFailed(
  resumeId: string,
  userId: string,
  error: string,
): Promise<void> {
  const ref = db.collection(SKILL_ANALYSIS).doc(resumeId);
  const snap = await ref.get();
  const data = {
    status: 'failed',
    error,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (snap.exists) {
    await ref.update(data as UpdateData<DocumentData>);
  } else {
    await ref.set({
      userId,
      resumeId,
      generatedAt: FieldValue.serverTimestamp(),
      ...data,
    });
  }
}
