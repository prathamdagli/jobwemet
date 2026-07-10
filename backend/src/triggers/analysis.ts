import { logger } from 'firebase-functions/v2';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

import { runAnalysis } from '../services/analysis';

/**
 * Auto-run AI analysis once a resume's processing pipeline reaches
 * status == "completed". Fires only on the transition into "completed"
 * (the processing record is updated several times before that), so it runs
 * exactly once. No manual API.
 */
export const onAnalysisStart = onDocumentUpdated(
  'resumeProcessing/{resumeId}',
  async (event) => {
    const before = event.data?.before.data() as { status?: string } | undefined;
    const after = event.data?.after.data() as { status?: string } | undefined;
    const resumeId = event.params.resumeId;

    if (!after || after.status !== 'completed') return;
    if (before && before.status === 'completed') return; // already handled

    logger.info(`resumeProcessing completed for ${resumeId} — starting AI analysis`);
    try {
      await runAnalysis(resumeId);
    } catch (err) {
      // Defensive: runAnalysis handles its own errors, but never let a trigger
      // rejection cause a retry storm.
      logger.error(`Analysis initiation failed for ${resumeId}`, err);
    }
  },
);
