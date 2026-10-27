"""
utils/config.py  -  Mr.INIX Central Settings
=============================================
One place that:
  * loads  backend/.env  (if it exists)  into the environment
  * reads and validates the startup settings
  * prints a startup summary (secrets are masked)

Priority:  `export VAR=...` in Termux  >  backend/.env  >  defaults below

Example backend/.env  (never commit this file - it is in .gitignore):
    MRINIX_PORT=5000
    MRINIX_DEBUG=1
    MRINIX_AI_KEY=your-api-key
    MRINIX_AI_MODEL=model-name-from-your-provider

All environment variables used anywhere in the backend
------------------------------------------------------
  Server      MRINIX_HOST, MRINIX_PORT, MRINIX_DEBUG, MRINIX_CORS_ORIGINS
  AI chat     MRINIX_AI_KEY, MRINIX_AI_MODEL, MRINIX_AI_URL        (ai/chatbot.py)
  Images      MRINIX_IMAGE_BASE, MRINIX_IMAGE_MODEL                (routes/image.py)
  Voice       OPENAI_API_KEY, MRINIX_STT_URL, MRINIX_STT_MODEL     (routes/voice.py)
  Translate   MRINIX_MYMEMORY_EMAIL                                (routes/translate.py)
  Memory      MRINIX_MEMORY_DB                                     (ai/memory.py)
"""

import os

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENV_FILE    = os.path.join(BACKEND_DIR, ".env")

# ------------------------------------------------------------
# Load backend/.env (optional). Real environment variables win.
# ------------------------------------------------------------
try:
    from dotenv import load_dotenv
    load_dotenv(ENV_FILE, override=False)
except ImportError:
    pass

ENV_FILE_FOUND = os.path.exists(ENV_FILE)

WARNINGS = []          # problems found while reading settings


# ------------------------------------------------------------
# Small readers with validation
# ------------------------------------------------------------
def env_str(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int, minimum: int, maximum: int) -> int:
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = int(raw)
    except ValueError:
        WARNINGS.append(f"{name}={raw!r} is not a number - using {default}")
        return default
    if not minimum <= value <= maximum:
        WARNINGS.append(f"{name}={value} is out of range ({minimum}-{maximum}) - using {default}")
        return default
    return value


def mask(secret: str) -> str:
    """Show just enough of a secret to recognise it."""
    if not secret:
        return "(not set)"
    return secret[:3] + "..." if len(secret) > 8 else "***"


# ------------------------------------------------------------
# Server settings (read once at startup)
# ------------------------------------------------------------
HOST  = env_str("MRINIX_HOST", "0.0.0.0")
PORT  = env_int("MRINIX_PORT", 5000, 1, 65535)

# Debug mode is OFF by default: with host 0.0.0.0 the Flask debugger would
# be reachable by every device on your Wi-Fi. Turn it on while developing
# (MRINIX_DEBUG=1) to get auto-reload on file changes.
DEBUG = env_bool("MRINIX_DEBUG", False)

_cors_raw = env_str("MRINIX_CORS_ORIGINS", "*")
CORS_ORIGINS = "*" if _cors_raw == "*" else [o.strip() for o in _cors_raw.split(",") if o.strip()]

DATABASE_DIR = os.path.join(BACKEND_DIR, "database")


# ------------------------------------------------------------
# AI settings (read when asked, so they always match the environment)
# ------------------------------------------------------------
def ai_key() -> str:
    return env_str("MRINIX_AI_KEY")


def ai_model() -> str:
    return env_str("MRINIX_AI_MODEL")


def ai_connected() -> bool:
    return bool(ai_key() and ai_model())


def get_warnings() -> list:
    found = list(WARNINGS)
    if ai_key() and not ai_model():
        found.append("MRINIX_AI_KEY is set but MRINIX_AI_MODEL is missing - AI stays off")
    if ai_model() and not ai_key():
        found.append("MRINIX_AI_MODEL is set but MRINIX_AI_KEY is missing - AI stays off")
    if HOST == "0.0.0.0" and DEBUG:
        found.append("Debug mode is on and the server is open to your network - "
                     "use MRINIX_DEBUG=0 on shared Wi-Fi")
    return found


def describe() -> dict:
    """Current settings with secrets masked (safe to print)."""
    return {
        "host": HOST,
        "port": PORT,
        "debug": DEBUG,
        "cors_origins": CORS_ORIGINS,
        "env_file_found": ENV_FILE_FOUND,
        "ai_connected": ai_connected(),
        "ai_model": ai_model() or "(not set)",
        "ai_key": mask(ai_key()),
    }


def startup_banner() -> str:
    ai = (f"connected (model: {ai_model()})" if ai_connected()
          else "basic mode (set MRINIX_AI_KEY and MRINIX_AI_MODEL)")
    lines = [
        "=" * 54,
        "  Mr.INIX Flask Backend",
        f"  Listening : http://{HOST}:{PORT}",
        f"  AI        : {ai}",
        f"  Debug     : {'on' if DEBUG else 'off (MRINIX_DEBUG=1 for auto-reload)'}",
        f"  .env file : {'loaded' if ENV_FILE_FOUND else 'not found (optional)'}",
        "  LAN IP    : ip addr | grep 'inet 192'",
    ]
    for warning in get_warnings():
        lines.append(f"  WARNING   : {warning}")
    lines.append("=" * 54)
    return "\n".join(lines)
