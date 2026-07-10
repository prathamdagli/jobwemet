import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * Extract plain text from a resume buffer. No OCR, no AI, no cleaning — just
 * the raw text content. Throws for unsupported or corrupt input so the caller
 * can record a failure.
 */
export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const mime = (mimeType || '').toLowerCase();

  if (mime === 'application/pdf') {
    const result = await pdfParse(buffer);
    return typeof result.text === 'string' ? result.text : '';
  }

  if (mime === DOCX_MIME) {
    const result = await mammoth.extractRawText({ buffer });
    return typeof result.value === 'string' ? result.value : '';
  }

  throw new Error(`Unsupported mime type for text extraction: ${mimeType || 'unknown'}`);
}
