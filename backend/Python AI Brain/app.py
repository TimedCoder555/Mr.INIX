from flask import Flask, request, jsonify
from flask_cors import CORS
from ai.chatbot import ChatBot

app = Flask(__name__)
CORS(app)

bot = ChatBot()

@app.route("/")
def home():
    return {"status": "Mr.INIX AI Running 🚀"}

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    message = data.get("message", "")

    reply = bot.get_response(message)

    return jsonify({
        "reply": reply
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)