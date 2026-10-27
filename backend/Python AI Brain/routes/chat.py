"""
routes/chat.py  -  Mr.INIX Chat Endpoint
=========================================
POST /chat

Request  (sent by frontend utils/api.js -> sendChat):
    {
      "message": "Hello!",
      "history": [ {"role": "user", "content": "..."},
                   {"role": "assistant", "content": "..."} ]
    }

Response (what ChatBox.jsx reads):
    { "reply": "..." }

Errors are always JSON: { "error": "..." }
"""

from flask import Blueprint, jsonify, request

bp = Blueprint("chat", __name__)

# Must match CHAT.MAX_INPUT_LENGTH / MAX_HISTORY_LENGTH in frontend constants.js
MAX_MESSAGE_LENGTH = 2000
MAX_HISTORY_LENGTH = 20
VALID_ROLES = {"user", "assistant"}


# ------------------------------------------------------------
# AI brain: uses ai/chatbot.py once it exists.
# Until then a simple built-in fallback keeps the app working.
# ------------------------------------------------------------
try:
    from ai.chatbot import get_reply
except ImportError:
    def get_reply(message: str, history: list) -> str:
        text = message.lower()
        if any(w in text for w in ("hello", "hi", "hey")):
            return "Hello! I'm Mr.INIX. How can I help you today?"
        if "who are you" in text or "your name" in text:
            return "I'm Mr.INIX, your futuristic AI assistant."
        if "how are you" in text:
            return "Running at full power and ready to help!"
        return f'You said: "{message}". My AI brain (ai/chatbot.py) is not connected yet.'


# Optional chat history (database/db.py). Does nothing unless MRINIX_SAVE_CHATS=1.
try:
    from database.db import save_exchange
except ImportError:
    def save_exchange(user_message: str, ai_reply: str):
        pass


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
def clean_history(raw) -> list:
    """Keep only valid {role, content} items, newest MAX_HISTORY_LENGTH."""
    if not isinstance(raw, list):
        return []

    cleaned = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        role    = item.get("role")
        content = item.get("content")
        if role in VALID_ROLES and isinstance(content, str) and content.strip():
            cleaned.append({"role": role, "content": content.strip()})

    return cleaned[-MAX_HISTORY_LENGTH:]


# ------------------------------------------------------------
# POST /chat
# ------------------------------------------------------------
@bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON"}), 400

    message = data.get("message")
    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "'message' is required and cannot be empty"}), 400

    message = message.strip()
    if len(message) > MAX_MESSAGE_LENGTH:
        return jsonify({
            "error": f"Message too long (max {MAX_MESSAGE_LENGTH} characters)"
        }), 400

    history = clean_history(data.get("history"))

    print(f"[Mr.INIX] User  -> {message[:80]}")

    try:
        reply = get_reply(message, history)
    except Exception as err:
        print(f"[Mr.INIX] AI error: {err}")
        return jsonify({"error": "The AI could not generate a reply"}), 500

    if not isinstance(reply, str) or not reply.strip():
        reply = "Sorry, I couldn't think of a reply. Please try again."

    print(f"[Mr.INIX] Reply -> {reply[:80]}")

    save_exchange(message, reply)

    return jsonify({"reply": reply})
