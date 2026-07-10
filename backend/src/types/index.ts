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

/** Lifecycle status of the resume processing pipeline. */
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Where the pipeline currently is. Mirrors the orchestration stages:
 * uploaded → validating → extracting_text → saving → completed | failed.
 */
export type ProcessingStep =
  | 'uploaded'
  | 'validating'
  | 'extracting_text'
  | 'saving'
  | 'completed'
  | 'failed';

/** Resume processing pipeline document stored at resumeProcessing/{resumeId}. */
export interface ResumeProcessing {
  resumeId: string;
  userId: string;
  status: ProcessingStatus;
  currentStep: ProcessingStep;
  progress: number;
  rawText: string;
  error: string;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  updatedAt: Timestamp;
}

/** Write-time shape for the initial (queued) record. */
export type ResumeProcessingCreate = Omit<
  ResumeProcessing,
  'startedAt' | 'updatedAt' | 'completedAt'
> & {
  startedAt: FieldValue;
  updatedAt: FieldValue;
  completedAt: null;
};

/** Patch accepted by updateProcessingStatus (timestamps handled internally). */
export interface ProcessingUpdate {
  status?: ProcessingStatus;
  currentStep?: ProcessingStep;
  progress?: number;
  rawText?: string;
  completedAt?: FieldValue | null;
}
