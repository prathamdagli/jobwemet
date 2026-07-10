import { onCall } from 'firebase-functions/v2/https';

import { auth, db, storage } from './config/admin';

// Admin SDK services — reused by every Cloud Function via this single init.
export { auth, db, storage };

// Smoke-test / connectivity endpoint.
// This is infrastructure, not business logic: it verifies the Functions
// runtime, Admin SDK initialization, and emulator wiring during setup.
// Real features (resume parsing, skill analysis, career matching, roadmaps)
// are added in later phases under services/ and triggers/.
export const healthCheck = onCall({ region: 'us-central1' }, () => {
  return { status: 'ok', service: 'jobwemet-functions' };
});
