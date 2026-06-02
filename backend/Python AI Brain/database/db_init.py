import sqlite3

# Users Database
users = sqlite3.connect("users.db")
cursor = users.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

users.commit()
users.close()

# Chats Database
chats = sqlite3.connect("chats.db")
cursor = chats.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS chats(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_message TEXT,
    ai_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

chats.commit()
chats.close()

# Memory Database
memory = sqlite3.connect("memory.db")
cursor = memory.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS memory(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT
)
""")

memory.commit()
memory.close()

print("Mr.INIX databases created successfully!")