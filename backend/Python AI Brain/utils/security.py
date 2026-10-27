"""
utils/security.py  -  Mr.INIX Backend Protection
=================================================
Your Flask server listens on 0.0.0.0, so every device on your Wi-Fi can
reach it. If you connect a paid AI key, a careless script or a bug could
burn through it quickly. This file adds three simple protections:

  1. Rate limiting   per device (IP) and per endpoint
  2. Request size    bodies over 6 MB are rejected with a clear error
  3. Safe headers    on every response

Turn it on from app.py (already wired):   init_security(app)
Turn rate limiting off while testing:     MRINIX_RATE_LIMIT=off

Default limits (per device, per minute)
---------------------------------------
    /chat 30   /image 10   /translate 20   /voice 10   anything else 60
Edit RATE_LIMITS below to change them. GET / (health check) is never limited.

Note: limits live in memory, so they reset when the server restarts.
This is protection against accidents and casual abuse on your own network,
not a replacement for a firewall if you ever host this on the internet.
"""

import math
import os
import threading
import time
from collections import deque

from flask import request

from utils.helpers import client_ip, json_error

# ------------------------------------------------------------
# Settings
# ------------------------------------------------------------
# bucket -> (max requests, window in seconds)
RATE_LIMITS = {
    "chat":      (30, 60),
    "image":     (10, 60),
    "translate": (20, 60),
    "voice":     (10, 60),
    "default":   (60, 60),
}

BUCKET_BY_PATH = {
    "/chat": "chat", "/image": "image",
    "/translate": "translate", "/voice": "voice",
}

MAX_BODY_BYTES = 6 * 1024 * 1024        # voice allows 5 MB audio + form overhead
CLEANUP_EVERY  = 500                    # purge idle entries every N checks


# ------------------------------------------------------------
# Rate limiter (sliding window, thread-safe)
# ------------------------------------------------------------
class RateLimiter:
    def __init__(self, clock=time.monotonic):
        self._hits  = {}                 # key -> deque of request times
        self._lock  = threading.Lock()
        self._clock = clock
        self._calls = 0

    def check(self, key: str, limit: int, window: float):
        """Returns (allowed, seconds_to_wait)."""
        now = self._clock()
        with self._lock:
            self._calls += 1
            if self._calls % CLEANUP_EVERY == 0:
                self._purge(now)

            hits = self._hits.setdefault(key, deque())
            while hits and now - hits[0] >= window:
                hits.popleft()

            if len(hits) >= limit:
                wait = max(1, math.ceil(window - (now - hits[0])))
                return False, wait

            hits.append(now)
            return True, 0

    def _purge(self, now: float):
        longest = max(w for _, w in RATE_LIMITS.values())
        stale = [k for k, h in self._hits.items() if not h or now - h[-1] >= longest]
        for k in stale:
            del self._hits[k]


limiter = RateLimiter()


def bucket_for(path: str) -> str:
    return BUCKET_BY_PATH.get(path, "default")


def rate_limit_enabled() -> bool:
    return os.environ.get("MRINIX_RATE_LIMIT", "on").strip().lower() not in {
        "off", "0", "false", "no"
    }


# ------------------------------------------------------------
# Flask hooks
# ------------------------------------------------------------
def enforce_rate_limit():
    # Preflight checks and the health ping must never be blocked.
    if request.method == "OPTIONS" or request.path == "/":
        return None

    bucket = bucket_for(request.path)
    limit, window = RATE_LIMITS[bucket]
    allowed, wait = limiter.check(f"{client_ip()}|{bucket}", limit, window)
    if allowed:
        return None

    print(f"[Mr.INIX] Rate limit hit: {client_ip()} on {request.path}")
    response, status = json_error(
        f"Too many requests. Please wait {wait} seconds and try again.", 429
    )
    response.headers["Retry-After"] = str(wait)
    return response, status


def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Cache-Control", "no-store")
    return response


def init_security(app):
    """Attach all protections to the Flask app."""
    app.config["MAX_CONTENT_LENGTH"] = MAX_BODY_BYTES

    @app.errorhandler(413)
    def too_large(_):
        mb = MAX_BODY_BYTES // (1024 * 1024)
        return json_error(f"Request too large (max {mb} MB)", 413)

    if rate_limit_enabled():
        app.before_request(enforce_rate_limit)
    else:
        print("[Mr.INIX] WARNING: rate limiting is OFF (MRINIX_RATE_LIMIT=off)")

    app.after_request(add_security_headers)
