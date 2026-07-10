import { FieldValue, type UpdateData } from 'firebase-admin/firestore';

import { db, storage } from '../config/admin';
import type { ResumeCreate, ResumeInput, ResumeRecord, ResumeStatus } from '../types';

const RESUMES = 'resumes';

/** Read a single resume metadata document, or null if it does not exist. */
export async function getResume(resumeId: string): Promise<ResumeRecord | null> {
  const snap = await db.collection(RESUMES).doc(resumeId).get();
  return snap.exists ? (snap.data() as ResumeRecord) : null;
}

/** List a user's resumes, newest upload first. */
export async function listUserResumes(userId: string): Promise<ResumeRecord[]> {
  const snap = await db
    .collection(RESUMES)
    .where('userId', '==', userId)
    .orderBy('uploadedAt', 'desc')
    .get();
  return snap.docs.map((d) => d.data() as ResumeRecord);
}

/**
 * Persist the metadata for an uploaded resume. The document id equals the
 * resume id so it stays linked to its Storage object
 * (users/{uid}/resumes/{resumeId}.pdf). Uses set() so re-uploading the same
 * resume id is idempotent (overwrites) rather than creating duplicates.
 */
export async function uploadResumeMetadata(input: ResumeInput): Promise<void> {
  const doc: ResumeCreate = {
    id: input.id,
    userId: input.userId,
    fileName: input.fileName,
    originalFileName: input.originalFileName,
    storagePath: input.storagePath,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    status: 'uploaded',
    uploadedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  await db.collection(RESUMES).doc(input.id).set(doc);
}

/** Update lifecycle status. updatedAt is always refreshed server-side. */
export async function updateResumeStatus(
  resumeId: string,
  status: ResumeStatus,
): Promise<void> {
  await db.collection(RESUMES).doc(resumeId).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  } as UpdateData<ResumeRecord>);
}

/**
 * Delete a resume end-to-end: remove the Storage object, then the metadata
 * document. Either step failing (e.g. already gone) is tolerated so we never
 * leave an orphan behind we could have cleaned up.
 */
export async function deleteResume(resumeId: string): Promise<void> {
  const record = await getResume(resumeId);
  if (record) {
    await deleteStorageObject(record.storagePath);
  }
  await db.collection(RESUMES).doc(resumeId).delete();
}

/** Delete a Storage object, tolerating a missing object (already deleted). */
export async function deleteStorageObject(storagePath: string): Promise<void> {
  try {
    await storage.bucket().file(storagePath).delete();
  } catch (err: unknown) {
    // storage/fileDoesNotExist is expected when the object is already gone.
    const code = (err as { code?: string })?.code;
    if (code !== 'storage/fileDoesNotExist') {
      throw err;
    }
  }
}
