import { logger } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { startProcessing } from '../services/processing';

/**
 * When a resume metadata document is created (by the Storage onFinalize
 * trigger), automatically begin the processing pipeline. The pipeline is
 * orchestrated in startProcessing(); this trigger only initiates it and is
 * wrapped so it never rejects (a rejected trigger would be retried by
 * Cloud Functions). startProcessing records its own failures.
 */
export const onResumeProcessingStart = onDocumentCreated(
  'resumes/{resumeId}',
  async (event) => {
    const resumeId = event.params.resumeId;
    logger.info(`Resume metadata created for ${resumeId} — starting processing pipeline`);
    try {
      await startProcessing(resumeId);
    } catch (err) {
      // Defensive: startProcessing already handles its errors, but never let a
      // trigger rejection bubble up and cause a retry storm.
      logger.error(`Processing pipeline initiation failed for ${resumeId}`, err);
    }
  },
);
