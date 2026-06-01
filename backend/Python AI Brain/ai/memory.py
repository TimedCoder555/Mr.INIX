import json
import os

MEMORY_FILE = "memory.json"


class Memory:

    def __init__(self):
        self.memory = self.load_memory()

    def load_memory(self):
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, "r") as file:
                return json.load(file)

        return {
            "user_name": "",
            "favorite_subject": "",
            "favorite_language": "",
            "last_message": ""
        }

    def save_memory(self):
        with open(MEMORY_FILE, "w") as file:
            json.dump(self.memory, file, indent=4)

    def set(self, key, value):
        self.memory[key] = value
        self.save_memory()

    def get(self, key):
        return self.memory.get(key)

    def get_all(self):
        return self.memory