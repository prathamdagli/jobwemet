import { onCall } from 'firebase-functions/v2/https';

import { auth, db, storage } from './config/admin';
import { onUserCreate } from './triggers/auth';
import {
  onResumeMetadataDeleted,
  onResumeStorageDeleted,
  onResumeUploaded,
} from './triggers/resume';
import { onResumeProcessingStart } from './triggers/processing';

// Admin SDK services — reused by every Cloud Function via this single init.
export { auth, db, storage };

// Triggers
export { onUserCreate };
export { onResumeUploaded, onResumeStorageDeleted, onResumeMetadataDeleted };
export { onResumeProcessingStart };

// Smoke-test / connectivity endpoint (infrastructure, not business logic).
export const healthCheck = onCall({ region: 'us-central1' }, () => {
  return { status: 'ok', service: 'jobwemet-backend' };
});
