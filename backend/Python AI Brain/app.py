from flask import Flask
from flask_cors import CORS

from routes.chat import chat_bp
from routes.image import image_bp
from routes.voice import voice_bp
from routes.translate import translate_bp

app = Flask(name)

CORS(app)

=========================

HOME ROUTE

=========================

@app.route("/")
def home():
return {
"name": "Mr.INIX",
"status": "online",
"version": "1.0.0"
}

=========================

REGISTER ROUTES

=========================

app.register_blueprint(chat_bp)

app.register_blueprint(image_bp)

app.register_blueprint(voice_bp)

app.register_blueprint(translate_bp)

=========================

START SERVER

=========================

if name == "main":

app.run(
    host="0.0.0.0",
    port=5000,
    debug=True
)