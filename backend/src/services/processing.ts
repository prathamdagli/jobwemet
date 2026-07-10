import { FieldValue, type UpdateData } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

import { db, storage } from '../config/admin';
import { getResume } from './resume';
import { extractResumeText } from '../utils/extraction';
import { isAllowedResumeMime } from '../utils/resumeValidation';
import type {
  ProcessingStatus,
  ProcessingStep,
  ProcessingUpdate,
  ResumeProcessing,
  ResumeProcessingCreate,
} from '../types';

const COLL = 'resumeProcessing';

/** Read the pipeline record, or null if it does not exist yet. */
export async function getProcessingRecord(
  resumeId: string,
): Promise<ResumeProcessing | null> {
  const snap = await db.collection(COLL).doc(resumeId).get();
  return snap.exists ? (snap.data() as ResumeProcessing) : null;
}

/** Create the initial "queued" record for a resume being processed. */
async function createProcessingRecord(
  resumeId: string,
  userId: string,
): Promise<void> {
  const doc: ResumeProcessingCreate = {
    resumeId,
    userId,
    status: 'queued',
    currentStep: 'uploaded',
    progress: 0,
    rawText: '',
    error: '',
    startedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    completedAt: null,
  };
  await db.collection(COLL).doc(resumeId).set(doc);
}

/** Patch the pipeline record; updatedAt is always refreshed server-side. */
export async function updateProcessingStatus(
  resumeId: string,
  patch: ProcessingUpdate,
): Promise<void> {
  const update: Record<string, unknown> = {
    ...patch,
    updatedAt: FieldValue.serverTimestamp(),
  };
  await db
    .collection(COLL)
    .doc(resumeId)
    .update(update as UpdateData<ResumeProcessing>);
}

/**
 * Mark the pipeline failed. Tolerant of a missing record: if the failure
 * happened before the record was created, one is written so the failure is
 * never silently lost. Never throws.
 */
export async function markProcessingFailed(
  resumeId: string,
  errorMessage: string,
  userId = '',
): Promise<void> {
  const ref = db.collection(COLL).doc(resumeId);
  const snap = await ref.get();
  try {
    if (snap.exists) {
      await ref.update({
        status: 'failed' as ProcessingStatus,
        currentStep: 'failed' as ProcessingStep,
        error: errorMessage,
        updatedAt: FieldValue.serverTimestamp(),
      } as UpdateData<ResumeProcessing>);
    } else {
      const doc: ResumeProcessingCreate = {
        resumeId,
        userId,
        status: 'failed',
        currentStep: 'failed',
        progress: 0,
        rawText: '',
        error: errorMessage,
        startedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: null,
      };
      await ref.set(doc);
    }
  } catch (err) {
    logger.error(`Could not record failure for ${resumeId}`, err);
  }
}

/** Download the resume bytes from Storage. Throws when the object is missing. */
async function downloadResume(storagePath: string): Promise<Buffer> {
  const [buffer] = await storage.bucket().file(storagePath).download();
  return buffer;
}

/**
 * Orchestrate the resume processing pipeline:
 *   queue → validate → extract text → store text → mark completed (ready for AI).
 * Every failure path is caught and recorded as a failed pipeline record, so
 * the function never crashes. No AI / skill extraction happens here.
 */
export async function startProcessing(resumeId: string): Promise<void> {
  try {
    const resume = await getResume(resumeId);
    if (!resume) {
      logger.error(`Processing failed for ${resumeId}: resume metadata not found`);
      await markProcessingFailed(resumeId, 'Resume metadata not found');
      return;
    }
    if (!resume.storagePath) {
      logger.error(`Processing failed for ${resumeId}: no storage path`);
      await markProcessingFailed(resumeId, 'Resume has no storage path', resume.userId);
      return;
    }

    // queue
    await createProcessingRecord(resumeId, resume.userId);
    logger.info(`Processing queued for ${resumeId}`);

    // validating
    await updateProcessingStatus(resumeId, {
      status: 'processing',
      currentStep: 'validating',
      progress: 20,
    });
    logger.info(`Validation started for ${resumeId}`);

    let buffer: Buffer;
    try {
      buffer = await downloadResume(resume.storagePath);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      logger.error(`Resume storage object missing for ${resumeId} (${code ?? 'unknown'})`);
      await markProcessingFailed(
        resumeId,
        'Resume storage object is missing or unreadable',
        resume.userId,
      );
      return;
    }

    if (!buffer || buffer.length === 0) {
      logger.warn(`Resume file is empty for ${resumeId}`);
      await markProcessingFailed(resumeId, 'Resume file is empty', resume.userId);
      return;
    }

    if (!isAllowedResumeMime(resume.mimeType)) {
      logger.warn(`Unsupported resume type for ${resumeId}: ${resume.mimeType ?? 'unknown'}`);
      await markProcessingFailed(
        resumeId,
        `Unsupported resume type: ${resume.mimeType ?? 'unknown'}`,
        resume.userId,
      );
      return;
    }

    // extracting
    await updateProcessingStatus(resumeId, {
      status: 'processing',
      currentStep: 'extracting_text',
      progress: 50,
    });
    logger.info(`Text extraction started for ${resumeId}`);

    let text: string;
    try {
      text = await extractResumeText(buffer, resume.mimeType);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Text extraction failed for ${resumeId}: ${msg}`);
      await markProcessingFailed(resumeId, `Text extraction failed: ${msg}`, resume.userId);
      return;
    }

    // saving
    await updateProcessingStatus(resumeId, {
      status: 'processing',
      currentStep: 'saving',
      progress: 80,
      rawText: text,
    });
    logger.info(`Extracted text saved for ${resumeId} (${text.length} chars)`);

    // completed → ready for AI
    await updateProcessingStatus(resumeId, {
      status: 'completed',
      currentStep: 'completed',
      progress: 100,
      completedAt: FieldValue.serverTimestamp(),
    });
    logger.info(`Processing completed for ${resumeId} — ready for AI`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Unexpected processing error for ${resumeId}: ${msg}`, err);
    await markProcessingFailed(resumeId, `Unexpected error: ${msg}`);
  }
}
