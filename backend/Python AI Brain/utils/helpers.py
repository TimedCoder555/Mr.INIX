"""
utils/helpers.py  -  Mr.INIX Shared Backend Helpers
====================================================
Small, reusable functions with no side effects. Used by
utils/security.py and database/db.py (next files); your existing
routes keep working exactly as they are.

    from utils.helpers import json_error, read_json_object, clean_text
"""

import unicodedata
import uuid
from datetime import datetime, timezone


# ------------------------------------------------------------
# Time and IDs
# ------------------------------------------------------------
def utc_now() -> str:
    """Current UTC time like '2026-10-27T14:05:09+00:00' (sortable, unambiguous)."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_id() -> str:
    """Short unique ID, e.g. 'a3f9c2d41b7e'."""
    return uuid.uuid4().hex[:12]


# ------------------------------------------------------------
# Text helpers
# ------------------------------------------------------------
def clean_text(text, max_len: int = 2000) -> str:
    """
    Tidy user text before using or storing it:
      - converts anything to a string
      - removes control characters (null bytes etc.), keeps newlines and tabs
      - normalises Windows line endings
      - limits blank lines to one in a row
      - trims spaces at both ends and cuts to max_len
    Emoji and non-English text are left untouched.
    """
    if text is None:
        return ""
    text = str(text).replace("\r\n", "\n").replace("\r", "\n")
    text = "".join(
        ch for ch in text
        if ch in "\n\t" or unicodedata.category(ch) != "Cc"
    )
    lines = [line.rstrip() for line in text.split("\n")]
    out, blank = [], 0
    for line in lines:
        blank = blank + 1 if not line else 0
        if blank <= 1:
            out.append(line)
    return "\n".join(out).strip()[:max_len].rstrip()


def truncate(text, limit: int = 80) -> str:
    """One-line preview for logs: 'hello wor...' """
    text = " ".join(str(text).split())
    return text if len(text) <= limit else text[: max(limit - 3, 0)] + "..."


def safe_int(value, default: int, minimum: int, maximum: int) -> int:
    """int(value) clamped to [minimum, maximum]; `default` if it isn't a number."""
    try:
        return max(minimum, min(maximum, int(value)))
    except (TypeError, ValueError):
        return default


# ------------------------------------------------------------
# Flask request / response helpers
# ------------------------------------------------------------
def json_error(message: str, status: int = 400):
    """Standard error reply: ({"error": message}, status)."""
    from flask import jsonify
    return jsonify({"error": message}), status


def read_json_object():
    """
    Read the request body as a JSON object (dict).
    Returns (data, None) on success or (None, error_response) on failure,
    so a route can do:

        data, err = read_json_object()
        if err:
            return err
    """
    from flask import request
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, json_error("Request body must be a JSON object", 400)
    return data, None


def client_ip() -> str:
    """
    Address of the device making the request.
    Uses the direct connection only (X-Forwarded-For can be faked by
    clients, so it is not trusted unless you put a proxy in front).
    """
    from flask import request
    return request.remote_addr or "unknown"
