import { FieldValue, type UpdateData } from 'firebase-admin/firestore';

import { db } from '../config/admin';
import { buildUserProfileDocument } from '../utils/profile';
import type { UserProfile, UserProfileCreate } from '../types';
import type { UserInput } from '../utils/validation';

const USERS = 'users';

/** Read a user profile, or null if it does not exist yet. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await db.collection(USERS).doc(uid).get();
  return snap.exists ? (snap.data() as UserProfile) : null;
}

/** Create the profile document. Never overwrites an existing one. */
export async function createUserProfile(input: UserInput): Promise<void> {
  const doc: UserProfileCreate = buildUserProfileDocument(input);
  await db.collection(USERS).doc(input.uid).set(doc);
}

/** Patch a profile. updatedAt is always refreshed server-side. */
export async function updateUserProfile(
  uid: string,
  patch: Partial<UserProfile>,
): Promise<void> {
  await db.collection(USERS).doc(uid).update({
    ...patch,
    updatedAt: FieldValue.serverTimestamp(),
  } as UpdateData<UserProfile>);
}
