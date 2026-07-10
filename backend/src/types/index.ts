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
