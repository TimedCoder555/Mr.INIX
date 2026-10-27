"""
app.py  -  Mr.INIX Flask Backend Entry Point
==============================================
Creates the Flask app, enables CORS, registers all route
blueprints, and starts the server on 0.0.0.0:5000 so the
React frontend (and other devices on your network) can reach it.

Run from the backend/ folder:
    pip install -r requirements.txt
    python app.py

Blueprints are registered safely: if a route file does not
exist yet (we are building file by file), the server still
starts and prints a warning instead of crashing.
"""

import importlib
import os
import time

from flask import Flask, jsonify, request
from flask_cors import CORS


# ------------------------------------------------------------
# Settings: utils/config.py loads backend/.env and validates them.
# The fallback keeps the server starting if that file is missing.
# ------------------------------------------------------------
try:
    from utils.config import HOST, PORT, DEBUG, CORS_ORIGINS, startup_banner
except ImportError:
    HOST  = os.environ.get("MRINIX_HOST", "0.0.0.0")
    PORT  = int(os.environ.get("MRINIX_PORT", "5000"))
    DEBUG = os.environ.get("MRINIX_DEBUG", "0") == "1"
    CORS_ORIGINS = "*"

    def startup_banner() -> str:
        return (f"Mr.INIX Flask Backend - http://{HOST}:{PORT}\n"
                "(utils/config.py not found - using defaults)")

# Blueprint modules to load: (module path, url prefix)
# Each module must expose a Blueprint named `bp`.
BLUEPRINTS = [
    ("routes.chat",      ""),   # POST /chat
    ("routes.image",     ""),   # POST /image
    ("routes.voice",     ""),   # POST /voice
    ("routes.translate", ""),   # POST /translate
]


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    # --------------------------------------------------------
    # CORS - lets React (port 3000) call Flask (port 5000)
    # --------------------------------------------------------
    CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}})

    # --------------------------------------------------------
    # Database (optional until database/db.py exists)
    # --------------------------------------------------------
    try:
        from database.db import init_db
        init_db()
        print("[Mr.INIX] Database ready")
    except ImportError:
        print("[Mr.INIX] database/db.py not found yet - skipping DB init")
    except Exception as err:
        print(f"[Mr.INIX] Database init failed: {err}")

    # --------------------------------------------------------
    # Register blueprints
    # --------------------------------------------------------
    for module_path, prefix in BLUEPRINTS:
        try:
            module = importlib.import_module(module_path)
            app.register_blueprint(module.bp, url_prefix=prefix)
            print(f"[Mr.INIX] Loaded {module_path}")
        except ImportError as err:
            print(f"[Mr.INIX] WARNING: could not load {module_path} ({err})")
        except AttributeError:
            print(f"[Mr.INIX] WARNING: {module_path} has no Blueprint named 'bp'")

    # --------------------------------------------------------
    # Request logging - proves POST /chat reaches Flask
    # --------------------------------------------------------
    @app.before_request
    def log_request():
        request._start = time.time()
        if request.method != "OPTIONS":
            print(f"[Mr.INIX] --> {request.method} {request.path} "
                  f"from {request.remote_addr}")

    @app.after_request
    def log_response(response):
        started = getattr(request, "_start", None)
        if started and request.method != "OPTIONS":
            ms = (time.time() - started) * 1000
            print(f"[Mr.INIX] <-- {response.status_code} "
                  f"{request.path} ({ms:.0f} ms)")
        return response

    # --------------------------------------------------------
    # Rate limits, body-size limit, safe headers (utils/security.py)
    # Registered after the logging hooks so blocked requests are logged too.
    # --------------------------------------------------------
    try:
        from utils.security import init_security
        init_security(app)
        print("[Mr.INIX] Security enabled")
    except ImportError:
        print("[Mr.INIX] utils/security.py not found - running without rate limits")

    # --------------------------------------------------------
    # Health check - frontend checkHealth() calls GET /
    # --------------------------------------------------------
    @app.route("/", methods=["GET"])
    def health():
        return jsonify({
            "status":  "online",
            "app":     "Mr.INIX",
            "version": "1.0.0",
        })

    # --------------------------------------------------------
    # JSON error handlers (frontend api.js expects JSON errors)
    # --------------------------------------------------------
    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": f"Route {request.path} not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return jsonify({"error": f"{request.method} not allowed on {request.path}"}), 405

    @app.errorhandler(500)
    def server_error(err):
        print(f"[Mr.INIX] ERROR: {err}")
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()


if __name__ == "__main__":
    print(startup_banner())
    app.run(host=HOST, port=PORT, debug=DEBUG)
