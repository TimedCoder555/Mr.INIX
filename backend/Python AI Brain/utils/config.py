import os

# =========================
# APP CONFIG
# =========================

APP_NAME = "Mr.INIX"

VERSION = "1.0.0"

DEBUG = True

HOST = "0.0.0.0"

PORT = 5000

# =========================
# DATABASE PATHS
# =========================

USERS_DB = "database/users.db"

CHATS_DB = "database/chats.db"

MEMORY_DB = "database/memory.db"

# =========================
# SECURITY
# =========================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "mr-inix-secret-key"
)