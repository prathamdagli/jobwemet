import type { FieldValue, Timestamp } from 'firebase-admin/firestore';

/** Sign-in method used to create the account. */
export type Provider = 'password' | 'google';

/**
 * The user profile document stored at users/{uid}.
 * This is the single source of truth for a user.
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  provider: Provider;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted: boolean;
  profileCompletion: number;
  targetCareer: string;
  currentResumeId: string | null;
}

/**
 * Shape used when creating the document. Timestamps are server-generated,
 * so they are FieldValue rather than Timestamp at write time.
 */
export type UserProfileCreate = Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

/**
 * Lifecycle status of a resume. Only the states needed by the upload +
 * metadata feature are defined here:
 *  - 'uploaded': file landed in Storage and Firestore metadata was written.
 *  - 'deleted':  the Storage object was removed, so the metadata is stale
 *                (marked rather than removed to avoid losing the record).
 * Later phases (parsing, skill extraction) will extend this union.
 */
export type ResumeStatus = 'uploaded' | 'deleted';

/** Fields supplied when the upload trigger creates the metadata record. */
export interface ResumeInput {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
}

/** The resume metadata document stored at resumes/{resumeId}. */
export interface ResumeRecord {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  status: ResumeStatus;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
}

/** Write-time shape: timestamps are server-generated. */
export type ResumeCreate = Omit<ResumeRecord, 'uploadedAt' | 'updatedAt' | 'status'> & {
  status: ResumeStatus;
  uploadedAt: FieldValue;
  updatedAt: FieldValue;
};
