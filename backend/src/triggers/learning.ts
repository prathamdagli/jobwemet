import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';

import { runLearningPipeline } from '../services/learning';

/**
 * Start the Learning Pipeline only when AI analysis transitions to completed.
 * Fires once per resume; never throws so the function wrapper stays healthy.
 */
export const onLearningStart = onDocumentUpdated('skillAnalysis/{resumeId}', async (event) => {
  const before = event.data?.before.data() as { status?: string } | undefined;
  const after = event.data?.after.data() as { status?: string } | undefined;
  const resumeId = event.params.resumeId;

  if (after?.status !== 'completed') return;
  if (before?.status === 'completed') return; // only on the transition

  try {
    await runLearningPipeline(resumeId);
  } catch (err) {
    logger.error(`Learning pipeline trigger failed for ${resumeId}`, err);
  }
});
