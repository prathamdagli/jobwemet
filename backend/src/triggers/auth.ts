import { auth } from 'firebase-functions/v1';
import { logger } from 'firebase-functions/v2';
import type { UserRecord } from 'firebase-admin/auth';

import { createUserProfile, getUserProfile } from '../services/userProfile';
import { detectProvider } from '../utils/profile';
import { validateUserInput } from '../utils/validation';

/**
 * Auth trigger: when a user registers (email/password or Google), create their
 * Firestore profile. Idempotent — an existing profile is left untouched.
 * Any failure is logged and swallowed so the trigger never crashes sign-up.
 *
 * Uses the 1st-gen onCreate event trigger. The installed firebase-functions
 * (v7) only exposes the blocking beforeUserCreated for 2nd-gen auth, which
 * cannot perform a non-blocking post-creation side effect; onCreate is the
 * canonical, production-proven pattern for provisioning a profile on sign-up.
 */
export const onUserCreate = auth.user().onCreate(async (user: UserRecord) => {
  const uid = user.uid;

  try {
    const provider = detectProvider(user);
    const result = validateUserInput({
      uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      provider,
    });

    if (!result.valid) {
      logger.error(`Profile creation skipped for ${uid}: ${result.error}`);
      return;
    }

    const existing = await getUserProfile(uid);
    if (existing) {
      logger.info(`Existing profile skipped for ${uid}`);
      return;
    }

    await createUserProfile(result.data);
    logger.info(`Profile created for ${uid}`);
  } catch (err) {
    logger.error(`Failed to create profile for ${uid}`, err);
  }
});
