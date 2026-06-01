from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {
        "name": "Mr.INIX",
        "status": "online",
        "version": "1.0.0"
    }

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    message = data.get("message", "")

    reply = f"Mr.INIX received: {message}"

    return jsonify({
        "success": True,
        "reply": reply
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )