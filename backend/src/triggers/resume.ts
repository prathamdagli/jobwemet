import { logger } from 'firebase-functions/v2';
import { onObjectDeleted, onObjectFinalized } from 'firebase-functions/v2/storage';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';

import { storage } from '../config/admin';
import {
  getResume,
  updateResumeStatus,
  uploadResumeMetadata,
} from '../services/resume';
import {
  buildStoragePath,
  isAllowedResumeMime,
  isWithinSizeLimit,
  parseResumeStoragePath,
} from '../utils/resumeValidation';

/**
 * Storage trigger: when a file is finalized under users/{uid}/resumes/, create
 * its Firestore metadata automatically. No AI / parsing / skill extraction —
 * this is upload + metadata only. Invalid files are deleted to avoid orphans.
 */
export const onResumeUploaded = onObjectFinalized(async (event) => {
  const object = event.data;
  const objectName = object?.name;

  const parsed = parseResumeStoragePath(objectName);
  if (!parsed) {
    // Not a resume path (avatars, exports, ...). Ignore.
    return;
  }
  const { userId, fileName, resumeId, ext } = parsed;

  // owner-only + type/size are enforced by storage.rules, but double-check
  // server-side as defense in depth.
  const size = typeof object.size === 'number' ? object.size : Number(object.size);
  if (!isAllowedResumeMime(object.contentType) || !isWithinSizeLimit(size)) {
    logger.warn(
      `Invalid resume file rejected for ${userId} (${fileName}, ` +
        `${object.contentType ?? 'unknown'}, ${size}B) — removing object`,
    );
    try {
      await storage.bucket(object.bucket).file(objectName!).delete();
    } catch (err) {
      logger.error(`Failed to remove invalid resume object ${objectName}`, err);
    }
    return;
  }

  const originalFileName =
    (object.metadata?.originalFileName as string | undefined) ?? fileName;

  try {
    await uploadResumeMetadata({
      id: resumeId,
      userId,
      fileName,
      originalFileName,
      storagePath: buildStoragePath(userId, fileName),
      mimeType: object.contentType!,
      fileSize: size,
    });
    logger.info(
      `Resume uploaded: metadata created for ${userId} — ${resumeId}.${ext} ` +
        `(${originalFileName})`,
    );
  } catch (err) {
    logger.error(`Failed to create resume metadata for ${resumeId}`, err);
  }
});

/**
 * Storage trigger: when a resume object disappears, mark its (still-present)
 * Firestore metadata accordingly so we don't keep a dangling "uploaded" record.
 * If the metadata was already removed by the other trigger, there is nothing
 * to do.
 */
export const onResumeStorageDeleted = onObjectDeleted(async (event) => {
  const parsed = parseResumeStoragePath(event.data?.name);
  if (!parsed) return;
  const { userId, resumeId, ext } = parsed;

  try {
    const existing = await getResume(resumeId);
    if (!existing) return; // already handled / never existed
    await updateResumeStatus(resumeId, 'deleted');
    logger.info(`Resume object deleted for ${userId} — marking ${resumeId}.${ext} as deleted`);
  } catch (err) {
    logger.error(`Failed to mark resume ${resumeId} as deleted`, err);
  }
});

/**
 * Firestore trigger: when resume metadata is deleted, remove the backing
 * Storage object so we never leave an orphan file behind.
 */
export const onResumeMetadataDeleted = onDocumentDeleted('resumes/{resumeId}', async (event) => {
  const resumeId = event.params.resumeId;
  const data = event.data?.data();
  const storagePath: string | undefined = data?.storagePath;

  if (!storagePath) {
    logger.warn(`Resume metadata ${resumeId} deleted without a storagePath; nothing to remove`);
    return;
  }

  try {
    await storage.bucket().file(storagePath).delete();
    logger.info(`Resume metadata deleted for ${resumeId} — Storage object removed (${storagePath})`);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'storage/fileDoesNotExist') {
      // Already gone — fine.
      return;
    }
    logger.error(`Failed to remove Storage object for deleted resume ${resumeId}`, err);
  }
});
