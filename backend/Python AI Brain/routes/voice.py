"""
routes/voice.py  -  Mr.INIX Voice Endpoint (optional server-side speech-to-text)
=================================================================================
POST /voice      multipart/form-data with an "audio" file

Response:
    { "transcript": "hello world" }

IMPORTANT
---------
The mic button in the app (VoiceButton.jsx) uses the BROWSER's built-in
Web Speech API, so it does NOT call this route. This route is an optional
fallback for browsers without speech recognition.

Real transcription needs a speech service. Heavy local models (Whisper,
Vosk) are not practical in Termux, so this route uses OpenAI's hosted
transcription API when a key is configured:

    export OPENAI_API_KEY="your-key"        # or put it in backend/.env

Without a key the route replies 501 (not configured) and nothing breaks.
"""

import os

import requests
from flask import Blueprint, jsonify, request

bp = Blueprint("voice", __name__)

TRANSCRIBE_URL = os.environ.get(
    "MRINIX_STT_URL", "https://api.openai.com/v1/audio/transcriptions"
)
TRANSCRIBE_MODEL = os.environ.get("MRINIX_STT_MODEL", "whisper-1")

MAX_AUDIO_BYTES = 5 * 1024 * 1024          # 5 MB
REQUEST_TIMEOUT = 30                        # seconds
ALLOWED_EXTENSIONS = {"webm", "wav", "mp3", "m4a", "ogg", "mp4"}


def get_api_key() -> str:
    # Read at request time so a key added to the environment is picked up.
    return os.environ.get("OPENAI_API_KEY", "").strip()


def extension_of(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


@bp.route("/voice", methods=["POST"])
def voice():
    # --- 1. Validate the upload -----------------------------
    audio = request.files.get("audio")
    if audio is None or not audio.filename:
        return jsonify({"error": "No audio file received (field name: 'audio')"}), 400

    if extension_of(audio.filename) not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        return jsonify({"error": f"Unsupported audio type. Allowed: {allowed}"}), 400

    audio_bytes = audio.read()
    if not audio_bytes:
        return jsonify({"error": "Audio file is empty"}), 400
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        return jsonify({"error": "Audio too large (max 5 MB)"}), 413

    # --- 2. Is a speech service configured? ------------------
    api_key = get_api_key()
    if not api_key:
        return jsonify({
            "error": (
                "Server-side transcription is not configured. "
                "Voice input in the app uses your browser's speech recognition."
            )
        }), 501

    # --- 3. Send to the speech service -----------------------
    print(f"[Mr.INIX] Voice -> {audio.filename} ({len(audio_bytes)} bytes)")
    try:
        response = requests.post(
            TRANSCRIBE_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            files={"file": (audio.filename, audio_bytes, audio.mimetype)},
            data={"model": TRANSCRIBE_MODEL},
            timeout=REQUEST_TIMEOUT,
        )
    except requests.Timeout:
        return jsonify({"error": "Speech service timed out"}), 504
    except requests.RequestException as err:
        print(f"[Mr.INIX] Voice network error: {err}")
        return jsonify({"error": "Could not reach the speech service"}), 502

    if not response.ok:
        print(f"[Mr.INIX] Voice service error {response.status_code}")
        return jsonify({"error": "Speech service rejected the request"}), 502

    try:
        transcript = (response.json().get("text") or "").strip()
    except ValueError:
        return jsonify({"error": "Speech service returned invalid data"}), 502

    if not transcript:
        return jsonify({"error": "No speech detected in the audio"}), 422

    print(f"[Mr.INIX] Transcript -> {transcript[:80]}")
    return jsonify({"transcript": transcript})
