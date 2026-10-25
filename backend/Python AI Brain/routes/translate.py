"""
routes/translate.py  -  Mr.INIX Translate Endpoint
===================================================
POST /translate

Request  (frontend utils/api.js -> translateText):
    { "text": "Hello, how are you?",
      "target_lang": "es",
      "source_lang": "auto" }          # source_lang optional, default "auto"

Response:
    { "translated_text": "Hola, como estas?",
      "source_lang": "en", "target_lang": "es" }

Provider: MyMemory (free, no API key).
  * Each request may carry at most ~500 bytes of text, so long text is
    split into chunks and translated piece by piece.
  * Anonymous use has a daily character quota. Setting the optional env
    var MRINIX_MYMEMORY_EMAIL sends your email with each request, which
    MyMemory uses to raise the free quota.
  * "auto" source detection is sent as "Autodetect". If your language
    is not detected correctly, pass source_lang explicitly (e.g. "fr").
"""

import os
import re

import requests
from flask import Blueprint, jsonify, request

bp = Blueprint("translate", __name__)

MYMEMORY_URL    = "https://api.mymemory.translated.net/get"
CONTACT_EMAIL   = os.environ.get("MRINIX_MYMEMORY_EMAIL", "").strip()
REQUEST_TIMEOUT = 15            # seconds per chunk

MAX_TEXT_CHARS  = 2000          # whole message limit
CHUNK_BYTES     = 450           # safely under MyMemory's 500-byte limit

LANG_PATTERN = re.compile(r"^[A-Za-z]{2,3}(-[A-Za-z]{2,4})?$")


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
def valid_lang(code: str) -> bool:
    return bool(LANG_PATTERN.match(code))


def split_into_chunks(text: str, max_bytes: int = CHUNK_BYTES) -> list:
    """Split text on word boundaries so each chunk is <= max_bytes (UTF-8)."""
    chunks, current = [], ""
    for word in text.split():
        # A single huge "word" (no spaces): cut it by characters.
        while len(word.encode("utf-8")) > max_bytes:
            cut = len(word) // 2
            while len(word[:cut].encode("utf-8")) > max_bytes:
                cut //= 2
            if current:
                chunks.append(current)
                current = ""
            chunks.append(word[:cut])
            word = word[cut:]

        candidate = f"{current} {word}".strip()
        if len(candidate.encode("utf-8")) <= max_bytes:
            current = candidate
        else:
            chunks.append(current)
            current = word

    if current:
        chunks.append(current)
    return chunks


class TranslateError(Exception):
    def __init__(self, message: str, status: int = 502):
        super().__init__(message)
        self.message = message
        self.status = status


def translate_chunk(chunk: str, source: str, target: str) -> str:
    params = {"q": chunk, "langpair": f"{source}|{target}"}
    if CONTACT_EMAIL:
        params["de"] = CONTACT_EMAIL

    try:
        response = requests.get(MYMEMORY_URL, params=params, timeout=REQUEST_TIMEOUT)
    except requests.Timeout:
        raise TranslateError("Translation service timed out", 504)
    except requests.RequestException as err:
        print(f"[Mr.INIX] Translate network error: {err}")
        raise TranslateError("Could not reach the translation service", 502)

    try:
        payload = response.json()
        translated = (payload.get("responseData") or {}).get("translatedText") or ""
        status = int(payload.get("responseStatus", response.status_code))
    except (ValueError, TypeError):
        raise TranslateError("Translation service returned invalid data", 502)

    # Quota exhausted: MyMemory puts a warning in the text field.
    if "MYMEMORY WARNING" in translated.upper() or status == 429:
        raise TranslateError(
            "Daily free translation limit reached. Try again tomorrow.", 429
        )
    if status != 200 or not translated:
        raise TranslateError("Translation failed for this text", 502)

    return translated


# ------------------------------------------------------------
# POST /translate
# ------------------------------------------------------------
@bp.route("/translate", methods=["POST"])
def translate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON"}), 400

    text = data.get("text")
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "'text' is required and cannot be empty"}), 400
    text = text.strip()
    if len(text) > MAX_TEXT_CHARS:
        return jsonify({
            "error": f"Text too long (max {MAX_TEXT_CHARS} characters)"
        }), 400

    target = str(data.get("target_lang") or "").strip()
    source = str(data.get("source_lang") or "auto").strip()

    if not valid_lang(target):
        return jsonify({"error": "'target_lang' must be a language code like 'es' or 'fr'"}), 400

    if source.lower() == "auto":
        source = "Autodetect"
    elif not valid_lang(source):
        return jsonify({"error": "'source_lang' must be a language code or 'auto'"}), 400

    if source.lower() == target.lower():
        return jsonify({"translated_text": text, "source_lang": source, "target_lang": target})

    print(f"[Mr.INIX] Translate -> {source}|{target}  {text[:50]}")

    try:
        pieces = [translate_chunk(c, source, target) for c in split_into_chunks(text)]
    except TranslateError as err:
        return jsonify({"error": err.message}), err.status

    return jsonify({
        "translated_text": " ".join(pieces),
        "source_lang": source,
        "target_lang": target,
    })
