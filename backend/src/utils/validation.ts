import type { Provider } from '../types';

/** Normalized input derived from a Firebase Auth user record. */
export interface UserInput {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: Provider;
}

export type ValidationResult =
  | { valid: true; data: UserInput }
  | { valid: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the minimum required identity fields before writing a profile.
 * displayName / photoURL are optional (handled gracefully by the caller);
 * uid and a well-formed email are mandatory. Invalid data is rejected so the
 * trigger can skip creation and log it instead of crashing.
 */
export function validateUserInput(input: {
  uid?: unknown;
  email?: unknown;
  displayName?: unknown;
  photoURL?: unknown;
  provider?: unknown;
}): ValidationResult {
  if (typeof input.uid !== 'string' || input.uid.trim().length === 0) {
    return { valid: false, error: 'Missing or invalid uid' };
  }
  if (typeof input.email !== 'string' || !EMAIL_RE.test(input.email)) {
    return { valid: false, error: 'Missing or invalid email' };
  }
  if (input.provider !== 'password' && input.provider !== 'google') {
    return { valid: false, error: 'Unsupported auth provider' };
  }

  return {
    valid: true,
    data: {
      uid: input.uid,
      email: input.email,
      displayName: typeof input.displayName === 'string' ? input.displayName : null,
      photoURL: typeof input.photoURL === 'string' ? input.photoURL : null,
      provider: input.provider,
    },
  };
}
