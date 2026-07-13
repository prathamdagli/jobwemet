const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Google sign-in popup was blocked by the browser.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/network-request-failed':
    'Network error. Check your connection and try again.',
  'auth/missing-password': 'Please enter your password.',
}

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code]
  }
  return 'Something went wrong. Please try again.'
}
