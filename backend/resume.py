"""Resume handling: validation, text extraction, Storage upload.

This module owns everything about the raw resume file. It does NOT
decide what the AI extracts from the text — that lives in ``career.py``.
"""
from __future__ import annotations

from typing import Optional

from . import database, models, utils
from .firebase import get_bucket

# Resume uploads are constrained to PDF / DOCX and < 10 MB,
# matching the Storage security rules consumed by the frontend.
MAX_BYTES = 10 * 1024 * 1024
ALLOWED_MIME = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}
ALLOWED_EXT = {"pdf", "docx"}


def validate_resume_file(filename: str, content_type: Optional[str], size: int) -> str:
    """Validate an upload and return its (sanitised) extension.

    Raises ``ValueError`` with a user-friendly message when invalid.
    """
    ext = (filename.rsplit(".", 1)[-1].lower() if "." in filename else "")
    if ext not in ALLOWED_EXT and content_type not in ALLOWED_MIME:
        raise ValueError("Only PDF or DOCX resumes are supported.")
    if size <= 0:
        raise ValueError("Uploaded file is empty.")
    if size > MAX_BYTES:
        raise ValueError("Resume must be smaller than 10 MB.")
    # Prefer the content type's canonical extension.
    return ALLOWED_MIME.get(content_type or "", ext)


def extract_text_from_bytes(data: bytes, filename: str) -> str:
    """Extract plain text from PDF/DOCX bytes.

    Parsers are imported lazily so the module loads even if a parser
    library is not installed — extraction only fails when actually used.
    """
    ext = (filename.rsplit(".", 1)[-1].lower() if "." in filename else "")
    if ext == "pdf":
        import fitz  # PyMuPDF

        with fitz.open(stream=data, filetype="pdf") as doc:
            return "\n".join(page.get_text() for page in doc)
    if ext == "docx":
        import docx  # python-docx

        document = docx.Document(stream=data)
        return "\n".join(p.text for p in document.paragraphs)
    raise ValueError(f"Cannot extract text from .{ext} files.")


def download_bytes(storage_path: str) -> bytes:
    """Read a blob's bytes from Cloud Storage."""
    bucket = get_bucket()
    blob = bucket.blob(storage_path)
    data = blob.download_as_bytes()
    if not isinstance(data, (bytes, bytearray)):
        raise RuntimeError("Storage returned no data.")
    return bytes(data)


def upload_bytes(uid: str, resume_id: str, data: bytes, ext: str) -> str:
    """Upload resume bytes and return the Storage path."""
    storage_path = f"users/{uid}/resumes/{resume_id}.{ext}"
    bucket = get_bucket()
    bucket.blob(storage_path).upload_from_string(
        data, content_type=f"application/{ext}"
    )
    return storage_path


def create_resume_record(
    uid: str,
    resume_id: str,
    original_filename: str,
    content_type: str,
    size: int,
    storage_path: str,
) -> models.Resume:
    """Persist a ``resumes`` document (status ``uploaded``)."""
    resume = models.Resume(
        id=resume_id,
        userId=uid,
        fileName=utils.safe_filename(original_filename),
        originalFileName=original_filename,
        storagePath=storage_path,
        mimeType=content_type,
        fileSize=size,
        status="uploaded",
        uploadedAt=utils.now(),
    )
    return database.save_resume(resume)


def mark_processing(
    uid: str,
    resume_id: str,
    status: str = "queued",
    progress: Optional[float] = None,
) -> models.Processing:
    """Persist a ``resumeProcessing`` document for a resume.

    ``userId`` is stored so the frontend's ``where('userId','==',uid)``
    query can surface the processing state for the signed-in user.
    """
    proc = models.Processing(
        resumeId=resume_id, userId=uid, status=status, progress=progress
    )
    return database.save_processing(proc)


def delete_storage_object(storage_path: str) -> bool:
    """Delete a Storage blob. Returns False when it does not exist.

    Best-effort: callers should log rather than fail the whole operation
    when a blob is already gone (e.g. after a partial prior delete).
    """
    bucket = get_bucket()
    blob = bucket.blob(storage_path)
    if not blob.exists():
        return False
    blob.delete()
    return True


def read_resume_text(uid: str, resume_id: str) -> str:
    """Download a stored resume and return its extracted text."""
    resume = database.get_resume(uid, resume_id)
    if resume is None:
        raise FileNotFoundError("Resume not found.")
    data = download_bytes(resume.storagePath)
    return extract_text_from_bytes(data, resume.originalFileName)
