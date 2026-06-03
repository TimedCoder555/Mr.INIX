# ============================================================
# app.py  —  Mr.INIX Flask Backend
# ============================================================
#
# Install deps:
#   pip install flask flask-cors
#
# Run (all interfaces — required for Termux / LAN access):
#   python app.py
#
# Test from terminal:
#   curl -X POST http://localhost:5000/chat \
#        -H "Content-Type: application/json" \
#        -d '{"message": "hello"}'
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# ── CORS ──────────────────────────────────────────────────────
# Allow requests from any origin during development.
# In production, replace "*" with your actual frontend URL:
#   CORS(app, origins=["https://yourdomain.com"])
CORS(app, origins="*")


# ── Health check ──────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "Mr.INIX backend is running ✅"})


# ── Main chat endpoint ─────────────────────────────────────────
@app.route("/chat", methods=["POST"])
def chat():
    # 1. Parse request body
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    user_message = data.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "Field 'message' is required and cannot be empty"}), 400

    print(f"[Mr.INIX] Received: {user_message}")  # ← visible in your terminal

    # 2. Generate reply  ← plug in your real AI logic here
    reply = generate_reply(user_message)

    print(f"[Mr.INIX] Sending : {reply}")

    # 3. Return JSON — frontend expects exactly { "reply": "..." }
    return jsonify({"reply": reply})


# ── AI logic (replace with your real model) ───────────────────
def generate_reply(message: str) -> str:
    """
    Replace this function body with your actual AI integration.

    Examples:
      - OpenAI:   openai.ChatCompletion.create(...)
      - Gemini:   google.generativeai.GenerativeModel(...)
      - Ollama:   requests.post("http://localhost:11434/api/chat", ...)
      - Custom:   your own ML model
    """
    msg = message.lower()

    if any(w in msg for w in ["hello", "hi", "hey"]):
        return "Hello! I'm Mr.INIX. What can I do for you?"
    if "your name" in msg or "who are you" in msg:
        return "I'm Mr.INIX, your AI assistant. Nice to meet you!"
    if "how are you" in msg:
        return "I'm running smoothly and ready to help!"
    if "bye" in msg or "goodbye" in msg:
        return "Goodbye! Come back anytime. 👋"

    return f"You said: \"{message}\". (Plug in your AI model in generate_reply() to get real answers.)"


# ── Entry point ───────────────────────────────────────────────
if __name__ == "__main__":
    # host="0.0.0.0"  →  listen on ALL interfaces (localhost + LAN)
    # This is REQUIRED for Termux / mobile access from other devices
    app.run(host="0.0.0.0", port=5000, debug=True)
