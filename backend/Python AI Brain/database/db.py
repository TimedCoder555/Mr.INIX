"""
database/db.py  -  Mr.INIX Local Database (SQLite)
===================================================
app.py calls init_db() once at startup. SQLite files are created
automatically inside backend/database/ - nothing to install.

    chats.db    optional server-side chat history      (this file)
    memory.db   facts Mr.INIX remembers about you      (ai/memory.py)

Saving chat history on the server is OFF by default (your chats already
live in the app on your phone). To turn it on:

    MRINIX_SAVE_CHATS=1        (in backend/.env)

There is no users.db: the app has no login, so there are no accounts to
store. It can be added later if you build sign-in.

Memory is capped at 5000 saved messages; the oldest are removed first.
"""

import os
import sqlite3
from contextlib import closing

from utils.helpers import clean_text, utc_now

try:
    from utils.config import DATABASE_DIR as DB_DIR
except ImportError:
    DB_DIR = os.path.abspath(os.path.dirname(__file__))

MAX_MESSAGES     = 5000          # total messages kept in chats.db
MAX_CONTENT      = 4000          # characters stored per message
DEFAULT_SESSION  = "default"
VALID_ROLES      = ("user", "assistant")


# ------------------------------------------------------------
# Connections
# ------------------------------------------------------------
def chats_path() -> str:
    return os.path.join(DB_DIR, "chats.db")


def connect() -> sqlite3.Connection:
    """Open chats.db (creates folder and tables on first use)."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(chats_path(), timeout=5)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS messages (
               id         INTEGER PRIMARY KEY AUTOINCREMENT,
               session_id TEXT NOT NULL,
               role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
               content    TEXT NOT NULL,
               created_at TEXT NOT NULL
           )"""
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_messages_session ON messages (session_id, id)"
    )
    return conn


def init_db():
    """Create all database files and tables. Safe to run every startup."""
    with closing(connect()):
        pass
    try:                                    # memory.db belongs to ai/memory.py
        from ai.memory import connect as memory_connect
        with closing(memory_connect()):
            pass
    except ImportError:
        pass


# ------------------------------------------------------------
# Chat history
# ------------------------------------------------------------
def chat_saving_enabled() -> bool:
    return os.environ.get("MRINIX_SAVE_CHATS", "0").strip().lower() in {
        "1", "true", "yes", "on"
    }


def save_message(role: str, content: str, session_id: str = DEFAULT_SESSION) -> bool:
    """Store one message. Returns False if it was rejected."""
    content = clean_text(content, MAX_CONTENT)
    if role not in VALID_ROLES or not content:
        return False

    with closing(connect()) as conn, conn:
        conn.execute(
            "INSERT INTO messages (session_id, role, content, created_at) "
            "VALUES (?, ?, ?, ?)",
            (session_id, role, content, utc_now()),
        )
        total = conn.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
        if total > MAX_MESSAGES:
            conn.execute(
                "DELETE FROM messages WHERE id NOT IN "
                "(SELECT id FROM messages ORDER BY id DESC LIMIT ?)",
                (MAX_MESSAGES,),
            )
    return True


def save_exchange(user_message: str, ai_reply: str):
    """
    Called by routes/chat.py after every reply. Does nothing unless
    MRINIX_SAVE_CHATS is on, and never raises - a database problem must
    not break the chat.
    """
    if not chat_saving_enabled():
        return
    try:
        save_message("user", user_message)
        save_message("assistant", ai_reply)
    except sqlite3.Error as err:
        print(f"[Mr.INIX] Could not save chat: {err}")


def get_messages(session_id: str = DEFAULT_SESSION, limit: int = 50) -> list:
    """Most recent `limit` messages, oldest first: [{role, content, created_at}]."""
    limit = max(1, min(int(limit), MAX_MESSAGES))
    with closing(connect()) as conn:
        rows = conn.execute(
            "SELECT role, content, created_at FROM ("
            "  SELECT id, role, content, created_at FROM messages "
            "  WHERE session_id = ? ORDER BY id DESC LIMIT ?"
            ") ORDER BY id",
            (session_id, limit),
        ).fetchall()
    return [{"role": r, "content": c, "created_at": t} for r, c, t in rows]


def count_messages() -> int:
    with closing(connect()) as conn:
        return conn.execute("SELECT COUNT(*) FROM messages").fetchone()[0]


def clear_chats() -> int:
    """Delete all saved chat messages. Returns how many were removed."""
    with closing(connect()) as conn, conn:
        return conn.execute("DELETE FROM messages").rowcount
