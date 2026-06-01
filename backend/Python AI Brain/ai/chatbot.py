import random

class ChatBot:

    def __init__(self):
        self.name = "Mr.INIX"

    def get_response(self, message):

        message = message.lower()

        # Basic AI responses
        if "hello" in message or "hi" in message:
            return "Hello! I am Mr.INIX 🤖 How can I help you?"

        elif "your name" in message:
            return "My name is Mr.INIX, your AI assistant."

        elif "who are you" in message:
            return "I am Mr.INIX AI Brain built for Chemix-Encyclopedia system."

        elif "help" in message:
            return "I can help you with chemistry, coding, and general questions."

        elif "joke" in message:
            jokes = [
                "Why do chemists like nitrates? Because they're cheaper than day rates 😆",
                "I would tell you a chemistry joke, but I know I wouldn't get a reaction 😄"
            ]
            return random.choice(jokes)

        elif "bye" in message:
            return "Goodbye! Stay curious 🧪⚡"

        # Default fallback AI
        else:
            return f"You said: {message}. I'm still learning 🧠🤖"