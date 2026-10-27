"""
ai/chatbot.py  -  Mr.INIX AI Brain
===================================
routes/chat.py calls:   get_reply(message, history) -> str

Reply order
-----------
0. ai/memory.py        (optional)  "remember that ...", "forget ..." commands
1. ai/chemistry_ai.py   (optional)  quick local chemistry answers
2. A real AI model      (optional)  any OpenAI-compatible chat API
3. Built-in replies     (always)    so the app never breaks

Connect a real model (backend/.env or `export` in Termux)
---------------------------------------------------------
    MRINIX_AI_KEY=your-api-key
    MRINIX_AI_MODEL=model-name-from-your-provider
    MRINIX_AI_URL=https://generativelanguage.googleapis.com/v1beta/openai   # default

The default URL is Google Gemini's OpenAI-compatible endpoint. Any other
provider that offers a "/chat/completions" API works by changing the URL
(OpenAI, Groq, OpenRouter, a local Ollama server, ...).
Model names change often, so there is no default: copy a current name
from your provider's docs.

Optional sibling modules (written in the next files). Their expected shape:
    ai/prompts.py        SYSTEM_PROMPT: str
    ai/memory.py         get_memory_context() -> str
    ai/chemistry_ai.py   try_chemistry(message: str) -> str | None
"""

import os
from datetime import datetime

import requests

try:                                    # backend/.env support (python-dotenv)
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ------------------------------------------------------------
# Optional modules - safe fallbacks until those files exist
# ------------------------------------------------------------
try:
    from ai.prompts import SYSTEM_PROMPT
except ImportError:
    SYSTEM_PROMPT = (
        "You are Mr.INIX, a friendly futuristic AI assistant. "
        "Give clear, helpful answers. Keep replies concise unless the "
        "user asks for detail."
    )

try:
    from ai.memory import get_memory_context
except ImportError:
    def get_memory_context() -> str:
        return ""

try:
    from ai.memory import try_memory_command
except ImportError:
    def try_memory_command(message: str):
        return None

try:
    from ai.chemistry_ai import try_chemistry, chemistry_context
except ImportError:
    def try_chemistry(message: str):
        return None

    def chemistry_context(message: str) -> str:
        return ""


# ------------------------------------------------------------
# Settings (read at call time so .env changes apply on restart)
# ------------------------------------------------------------
DEFAULT_AI_URL  = "https://generativelanguage.googleapis.com/v1beta/openai"
REQUEST_TIMEOUT = 30
TEMPERATURE     = 0.7


def ai_settings() -> dict:
    return {
        "key":   os.environ.get("MRINIX_AI_KEY", "").strip(),
        "model": os.environ.get("MRINIX_AI_MODEL", "").strip(),
        "url":   os.environ.get("MRINIX_AI_URL", DEFAULT_AI_URL).strip().rstrip("/"),
    }


def ai_is_configured() -> bool:
    cfg = ai_settings()
    return bool(cfg["key"] and cfg["model"])


# ------------------------------------------------------------
# Real AI model call (OpenAI-compatible chat completions)
# ------------------------------------------------------------
class AIServiceError(Exception):
    pass


def build_messages(message: str, history: list) -> list:
    system = SYSTEM_PROMPT
    memory = get_memory_context()
    if memory:
        system += "\n\nWhat you know about the user:\n" + memory

    chem = chemistry_context(message)
    if chem:
        system += "\n\n" + chem

    # The frontend already includes the newest user message in history.
    # Drop it so the model doesn't see the same message twice.
    if (history and history[-1].get("role") == "user"
            and history[-1].get("content") == message):
        history = history[:-1]

    return (
        [{"role": "system", "content": system}]
        + [{"role": h["role"], "content": h["content"]} for h in history]
        + [{"role": "user", "content": message}]
    )


def call_model(message: str, history: list) -> str:
    cfg = ai_settings()
    try:
        response = requests.post(
            f"{cfg['url']}/chat/completions",
            headers={
                "Authorization": f"Bearer {cfg['key']}",
                "Content-Type":  "application/json",
            },
            json={
                "model":       cfg["model"],
                "messages":    build_messages(message, history),
                "temperature": TEMPERATURE,
            },
            timeout=REQUEST_TIMEOUT,
        )
    except requests.Timeout:
        raise AIServiceError("AI service timed out")
    except requests.RequestException as err:
        raise AIServiceError(f"could not reach AI service ({err})")

    if not response.ok:
        # Show the provider's own error text in the Termux log (helps with
        # wrong key / wrong model name). Never sent to the user's screen.
        raise AIServiceError(f"AI service HTTP {response.status_code}: {response.text[:300]}")

    try:
        text = response.json()["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError):
        raise AIServiceError("AI service returned an unexpected response")

    text = (text or "").strip()
    if not text:
        raise AIServiceError("AI service returned an empty reply")
    return text


# ------------------------------------------------------------
# Built-in fallback replies (no internet or key needed)
# ------------------------------------------------------------
def builtin_reply(message: str) -> str:
    text = message.lower()

    if any(w in text.split() for w in ("hello", "hi", "hey")):
        return "Hello! I'm Mr.INIX. How can I help you today?"
    if "who are you" in text or "your name" in text:
        return "I'm Mr.INIX, your futuristic AI assistant."
    if "how are you" in text:
        return "Running at full power and ready to help!"
    if "time" in text and "what" in text:
        return f"It's {datetime.now().strftime('%I:%M %p')} on the server."
    if "date" in text and "what" in text:
        return f"Today is {datetime.now().strftime('%A, %B %d, %Y')}."
    if "thank" in text:
        return "You're welcome!"
    if any(w in text for w in ("bye", "goodbye")):
        return "Goodbye! Come back anytime."
    if "help" in text:
        return ("I can chat, translate text, and create images. "
                "Connect an AI model in backend/.env to unlock smarter answers.")

    return ("I'm running in basic mode right now, so I can only handle simple "
            "questions. Connect an AI model (MRINIX_AI_KEY and MRINIX_AI_MODEL "
            "in backend/.env) for full answers.")


# ------------------------------------------------------------
# Public function used by routes/chat.py
# ------------------------------------------------------------
def get_reply(message: str, history: list = None) -> str:
    history = history or []

    # 0. Memory commands: "remember that ...", "forget ...", "my name is ..."
    memory_reply = try_memory_command(message)
    if memory_reply:
        return memory_reply

    # 1. Local chemistry shortcut (optional module)
    try:
        chem = try_chemistry(message)
        if chem:
            return chem
    except Exception as err:
        print(f"[Mr.INIX] chemistry_ai error: {err}")

    # 2. Real AI model
    if ai_is_configured():
        try:
            return call_model(message, history)
        except AIServiceError as err:
            print(f"[Mr.INIX] AI error: {err}")
            return (builtin_reply(message)
                    + "\n\n(My AI service is unavailable right now - "
                      "check the Termux log for details.)")

    # 3. Built-in fallback
    return builtin_reply(message)
