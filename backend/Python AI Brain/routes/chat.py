from flask import Blueprint, request, jsonify

from ai.chatbot import ChatBot

chat_bp = Blueprint(
    "chat",
    __name__
)

bot = ChatBot()


@chat_bp.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No data received"
            }), 400

        message = data.get("message", "")

        if not message.strip():
            return jsonify({
                "success": False,
                "error": "Message is empty"
            }), 400

        reply = bot.get_response(message)

        return jsonify({
            "success": True,
            "user_message": message,
            "reply": reply
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500