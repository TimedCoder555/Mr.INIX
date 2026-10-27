"""
ai/memory.py  -  Mr.INIX Long-Term Memory
==========================================
Remembers short facts about YOU between sessions (your name, things you
ask it to remember). Stored locally in SQLite - nothing leaves your device.

Used by ai/chatbot.py:
    get_memory_context()      -> text added to the AI's instructions
    try_memory_command(msg)   -> reply if the message is a memory command,
                                 otherwise None

Things you can say in the chat
------------------------------
    "My name is Sam"                      saves your name
    "Remember that I prefer short answers"
    "What do you remember about me?"      lists saved facts
    "Forget that I prefer short answers"  removes matching facts
    "Forget my name"
    "Forget everything"                   clears all memory

Rules: max 50 facts, 200 characters each, and passwords / API keys are
refused on purpose.
"""

import os
import re
import sqlite3
from contextlib import closing
from datetime import datetime

MAX_FACTS      = 50
MAX_FACT_CHARS = 200
MAX_CONTEXT    = 1500            # characters sent to the AI
MIN_FORGET_LEN = 3               # avoid "forget that a" wiping everything

DEFAULT_DB = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "database", "memory.db"
)

SECRET_WORDS = re.compile(
    r"pass(?:word|code)|api[\s_-]?key|secret|token|private[\s_-]?key|\bpin\b",
    re.IGNORECASE,
)


# ------------------------------------------------------------
# Database helpers
# ------------------------------------------------------------
def db_path() -> str:
    return os.path.abspath(os.environ.get("MRINIX_MEMORY_DB", DEFAULT_DB))


def connect() -> sqlite3.Connection:
    path = db_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path, timeout=5)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS facts (
               id         INTEGER PRIMARY KEY AUTOINCREMENT,
               key        TEXT UNIQUE,
               text       TEXT NOT NULL,
               created_at TEXT NOT NULL
           )"""
    )
    return conn


def clean_fact(text: str) -> str:
    """One tidy line, trimmed to MAX_FACT_CHARS."""
    text = " ".join(str(text).split())
    return text[:MAX_FACT_CHARS].strip()


# ------------------------------------------------------------
# Public memory API
# ------------------------------------------------------------
def list_facts() -> list:
    with closing(connect()) as conn:
        rows = conn.execute("SELECT text FROM facts ORDER BY id").fetchall()
    return [r[0] for r in rows]


def remember(text: str, key: str = None) -> str:
    """Save a fact. Returns "saved", "updated", "duplicate", "full" or "refused"."""
    text = clean_fact(text)
    if not text:
        return "refused"
    if SECRET_WORDS.search(text):
        return "refused"

    with closing(connect()) as conn:
        if key:
            row = conn.execute("SELECT id FROM facts WHERE key = ?", (key,)).fetchone()
            if row:
                conn.execute("UPDATE facts SET text = ? WHERE id = ?", (text, row[0]))
                conn.commit()
                return "updated"

        dup = conn.execute(
            "SELECT 1 FROM facts WHERE lower(text) = lower(?)", (text,)
        ).fetchone()
        if dup:
            return "duplicate"

        count = conn.execute("SELECT COUNT(*) FROM facts").fetchone()[0]
        if count >= MAX_FACTS:
            return "full"

        conn.execute(
            "INSERT INTO facts (key, text, created_at) VALUES (?, ?, ?)",
            (key, text, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()
    return "saved"


def forget(term: str) -> int:
    """Delete facts containing `term` (or with that key). Returns how many."""
    term = " ".join(str(term).split()).lower()
    if len(term) < MIN_FORGET_LEN:
        return 0
    with closing(connect()) as conn:
        cur = conn.execute(
            "DELETE FROM facts WHERE instr(lower(text), ?) > 0 OR lower(key) = ?",
            (term, term),
        )
        conn.commit()
        return cur.rowcount


def clear_all() -> int:
    with closing(connect()) as conn:
        cur = conn.execute("DELETE FROM facts")
        conn.commit()
        return cur.rowcount


def get_memory_context() -> str:
    """Bulleted facts for the AI's instructions (newest kept if too long)."""
    try:
        facts = list_facts()
    except sqlite3.Error as err:
        print(f"[Mr.INIX] Memory read error: {err}")
        return ""

    lines, total = [], 0
    for fact in reversed(facts):                      # newest first
        if total + len(fact) + 3 > MAX_CONTEXT:
            break
        lines.append(f"- {fact}")
        total += len(fact) + 3
    return "\n".join(reversed(lines))


# ------------------------------------------------------------
# Chat commands
# ------------------------------------------------------------
RE_CLEAR = re.compile(
    r"^\s*(?:please\s+)?(?:forget\s+(?:everything|all)(?:\s+about\s+me)?"
    r"|(?:clear|wipe|reset)\s+(?:my\s+)?memory)\s*[.!]?\s*$", re.IGNORECASE)

RE_LIST = re.compile(
    r"\bwhat\s+(?:do|did)\s+you\s+(?:remember|know)\b"
    r"|\bwhat\s+have\s+you\s+(?:remembered|saved)\b"
    r"|\bshow\s+(?:my\s+)?memory\b", re.IGNORECASE)

RE_FORGET = re.compile(
    r"^\s*(?:please\s+)?forget\s+(?:that\s+|my\s+)(.+?)\s*[.!]?\s*$", re.IGNORECASE)

RE_NAME = re.compile(
    r"^\s*(?:(?:hi|hello|hey)[,!]?\s+)?(?:my\s+name\s+is|call\s+me)\s+"
    r"([A-Za-z][A-Za-z'\-]{1,24}(?:\s+[A-Za-z][A-Za-z'\-]{1,24})?)\s*[.!]?\s*$",
    re.IGNORECASE)

RE_REMEMBER = re.compile(
    r"^\s*(?:please\s+)?remember\s+(?:that\s+|:\s*)(.+)$"
    r"|^\s*(?:please\s+)?remember\s+((?:my|i|i'm|i\s+am)\b.+)$",
    re.IGNORECASE | re.DOTALL)


def try_memory_command(message: str):
    """Return a reply if `message` is a memory command, else None."""
    try:
        return _handle_command(message)
    except sqlite3.Error as err:
        print(f"[Mr.INIX] Memory error: {err}")
        return "Sorry, I couldn't access my memory right now."


def _handle_command(message: str):
    if RE_CLEAR.match(message):
        n = clear_all()
        return "Done - I've forgotten everything." if n else "I wasn't remembering anything yet."

    if RE_LIST.search(message):
        facts = list_facts()
        if not facts:
            return "I don't have anything saved about you yet. Say \"remember that ...\" to teach me."
        return "Here's what I remember:\n" + "\n".join(f"- {f}" for f in facts)

    m = RE_FORGET.match(message)
    if m:
        n = forget(m.group(1))
        if n:
            return f"Okay, I forgot {n} saved {'fact' if n == 1 else 'facts'}."
        return "I couldn't find anything saved matching that."

    m = RE_NAME.match(message)
    if m:
        name = " ".join(w.capitalize() for w in m.group(1).split())
        remember(f"The user's name is {name}.", key="name")
        return f"Nice to meet you, {name}! I'll remember your name."

    m = RE_REMEMBER.match(message)
    if m:
        fact = m.group(1) or m.group(2)
        result = remember(fact)
        return {
            "saved":     "Got it - I'll remember that.",
            "duplicate": "I already have that saved.",
            "full":      f"My memory is full ({MAX_FACTS} facts). Say \"forget that ...\" to free space.",
            "refused":   "I can't save that. I don't store passwords, keys or secrets.",
        }.get(result, "Got it.")

    return None
