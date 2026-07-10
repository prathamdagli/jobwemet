import { onCall } from 'firebase-functions/v2/https';

import { auth, db, storage } from './config/admin';
import { onUserCreate } from './triggers/auth';

// Admin SDK services — reused by every Cloud Function via this single init.
export { auth, db, storage };

// Triggers
export { onUserCreate };

// Smoke-test / connectivity endpoint (infrastructure, not business logic).
export const healthCheck = onCall({ region: 'us-central1' }, () => {
  return { status: 'ok', service: 'jobwemet-backend' };
});
