/** Allowed resume MIME types. Anything else is rejected. */
export const ALLOWED_RESUME_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/** Maximum accepted upload size: 10 MB. */
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export function isAllowedResumeMime(mime: string | undefined): boolean {
  return !!mime && (ALLOWED_RESUME_MIME as readonly string[]).includes(mime);
}

export function isWithinSizeLimit(size: number): boolean {
  return Number.isFinite(size) && size > 0 && size <= MAX_RESUME_BYTES;
}

export interface ParsedResumePath {
  userId: string;
  /** Storage object name, including extension, e.g. "abc123.pdf". */
  fileName: string;
  /** Resume id derived from the file name (extension stripped). */
  resumeId: string;
  /** Lowercased extension without the dot, e.g. "pdf". */
  ext: string;
}

/**
 * Parse a Storage object name into its resume components, or return null when
 * the path is not a resume upload (e.g. avatars, exports). Expected layout:
 * users/{uid}/resumes/{resumeId}.pdf | .docx
 */
export function parseResumeStoragePath(objectName: string | undefined): ParsedResumePath | null {
  if (!objectName) return null;
  const parts = objectName.split('/');
  if (parts.length !== 4) return null;
  if (parts[0] !== 'users' || parts[2] !== 'resumes') return null;

  const userId = parts[1];
  const fileName = parts[3];
  if (!userId || !fileName) return null;

  const dot = fileName.lastIndexOf('.');
  if (dot <= 0) return null; // no extension, or a dot-only name
  const resumeId = fileName.slice(0, dot);
  const ext = fileName.slice(dot + 1).toLowerCase();
  if (!resumeId || !ext) return null;

  return { userId, fileName, resumeId, ext };
}

/** Map a file extension + mime type to the stored storagePath. */
export function buildStoragePath(userId: string, fileName: string): string {
  return `users/${userId}/resumes/${fileName}`;
}
