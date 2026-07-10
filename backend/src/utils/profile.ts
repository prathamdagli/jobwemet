import { FieldValue } from 'firebase-admin/firestore';
import type { UserRecord } from 'firebase-admin/auth';

import type { Provider, UserProfileCreate } from '../types';
import type { UserInput } from './validation';

/**
 * Determine the provider from the Auth user record. Google sign-ins carry a
 * google.com provider entry; everything else is treated as email/password.
 */
export function detectProvider(user: UserRecord): Provider {
  const ids = user.providerData.map((p) => p.providerId);
  return ids.includes('google.com') ? 'google' : 'password';
}

/**
 * Build the profile document written on first sign-up. Timestamps are
 * server-generated. A missing displayName falls back to the email local-part.
 */
export function buildUserProfileDocument(input: UserInput): UserProfileCreate {
  const displayName =
    input.displayName?.trim() || input.email.split('@')[0] || 'New User';

  return {
    uid: input.uid,
    displayName,
    email: input.email,
    photoURL: input.photoURL,
    provider: input.provider,
    onboardingCompleted: false,
    profileCompletion: 20,
    targetCareer: '',
    currentResumeId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}
