"""
routes/image.py  -  Mr.INIX Image Endpoint
===========================================
POST /image

Request  (frontend utils/api.js -> generateImage):
    { "prompt": "a purple dragon over a city",
      "width": 1024, "height": 1024 }          # width/height optional

Response:
    { "image_url": "https://image.pollinations.ai/prompt/...", "prompt": "..." }

How it works
------------
No API key needed. We build a Pollinations.ai image URL and return it.
The browser downloads the image straight from Pollinations, so Flask
uses no extra bandwidth or memory (good for Termux).

Pollinations is a free third-party service: it can be slow, rate-limited,
or change in future. To use another provider later, only change
build_image_url() below.
"""

import os
import random
from urllib.parse import quote, urlencode

from flask import Blueprint, jsonify, request

bp = Blueprint("image", __name__)

IMAGE_BASE_URL = os.environ.get(
    "MRINIX_IMAGE_BASE", "https://image.pollinations.ai/prompt"
)
IMAGE_MODEL = os.environ.get("MRINIX_IMAGE_MODEL", "flux")

MAX_PROMPT_LENGTH = 500
MIN_SIZE, MAX_SIZE, DEFAULT_SIZE = 256, 1536, 1024


def clamp_size(value, default=DEFAULT_SIZE) -> int:
    """Return an int between MIN_SIZE and MAX_SIZE, or the default."""
    try:
        return max(MIN_SIZE, min(MAX_SIZE, int(value)))
    except (TypeError, ValueError):
        return default


def build_image_url(prompt: str, width: int, height: int, seed: int) -> str:
    params = urlencode({
        "width":  width,
        "height": height,
        "model":  IMAGE_MODEL,
        "seed":   seed,
        "nologo": "true",
    })
    return f"{IMAGE_BASE_URL}/{quote(prompt)}?{params}"


@bp.route("/image", methods=["POST"])
def image():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON"}), 400

    prompt = data.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        return jsonify({"error": "'prompt' is required - describe the image"}), 400

    prompt = prompt.strip()
    if len(prompt) > MAX_PROMPT_LENGTH:
        return jsonify({
            "error": f"Prompt too long (max {MAX_PROMPT_LENGTH} characters)"
        }), 400

    width  = clamp_size(data.get("width"))
    height = clamp_size(data.get("height"))
    seed   = random.randint(1, 999_999)

    url = build_image_url(prompt, width, height, seed)
    print(f"[Mr.INIX] Image -> {prompt[:60]} ({width}x{height})")

    return jsonify({"image_url": url, "prompt": prompt})
