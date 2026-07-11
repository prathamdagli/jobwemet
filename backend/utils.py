"""Small, dependency-free helpers shared across the backend modules."""
from __future__ import annotations

import datetime as _dt
import re
import uuid as _uuid


def generate_id(prefix: str = "") -> str:
    """Return a stable-looking random id, optionally prefixed."""
    rid = _uuid.uuid4().hex
    return f"{prefix}{rid}" if prefix else rid


def now() -> _dt.datetime:
    """Current UTC time (timezone-aware)."""
    return _dt.datetime.now(_dt.timezone.utc)


def now_iso() -> str:
    """Current UTC time as an ISO-8601 string."""
    return now().isoformat()


def slugify(text: str, max_len: int = 64) -> str:
    """Turn arbitrary text into a url/key-safe slug."""
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:max_len] or "item"


def safe_filename(name: str) -> str:
    """Strip a path to its bare filename."""
    return name.replace("\\", "/").split("/")[-1] or "resume"
