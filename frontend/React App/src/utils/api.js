/* ============================================================
   api.js  —  Mr.INIX Frontend ↔ Flask API Layer
   All network calls live here. Components never use
   fetch() directly — they always call these functions.
   ============================================================ */

import { API, ERRORS } from "./constants";
import { trimHistory } from "./helpers";


/* ══════════════════════════════════════════════════════════
   1. CORE FETCH WRAPPER
      Single function that every API call goes through.
      Handles: base URL, timeout, retries, error parsing.
   ══════════════════════════════════════════════════════════ */

/**
 * Internal fetch wrapper with timeout + retry logic
 * @param {string} endpoint   e.g. "/chat"
 * @param {object} options    fetch options (method, body, etc.)
 * @param {number} retries    retries remaining
 * @returns {Promise<object>} parsed JSON response
 */
async function apiFetch(endpoint, options = {}, retries = API.RETRY_COUNT) {
  // Build URL — CRA proxy handles routing to Flask when BASE_URL is ""
  // Falls back to direct Flask IP if proxy is not available
  const url = `${API.BASE_URL}${endpoint}`;

  // Attach timeout via AbortController
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), API.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Accept":       "application/json",
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    // ── Non-2xx response ──────────────────────────────────
    if (!response.ok) {
      let errorMsg = ERRORS.SERVER;
      try {
        const errData = await response.json();
        errorMsg = errData.error || errData.message || ERRORS.SERVER;
      } catch {
        // response body wasn't JSON — use status text
        errorMsg = `Server error ${response.status}: ${response.statusText}`;
      }
      throw new APIError(errorMsg, response.status, false); // don't retry 4xx/5xx
    }

    // ── Parse JSON ────────────────────────────────────────
    try {
      return await response.json();
    } catch {
      throw new APIError("Backend returned invalid JSON.", 200, false);
    }

  } catch (err) {
    clearTimeout(timeoutId);

    // ── Timeout ───────────────────────────────────────────
    if (err.name === "AbortError") {
      throw new APIError(ERRORS.TIMEOUT, 0, retries > 0);
    }

    // ── Already an APIError — respect its retryable flag ──
    if (err instanceof APIError) {
      if (err.retryable && retries > 0) {
        await sleep(API.RETRY_DELAY);
        return apiFetch(endpoint, options, retries - 1);
      }
      throw err;
    }

    // ── Network failure (Flask not running, wrong IP, etc.)
    const networkError = new APIError(ERRORS.NETWORK, 0, retries > 0);
    if (networkError.retryable && retries > 0) {
      await sleep(API.RETRY_DELAY);
      return apiFetch(endpoint, options, retries - 1);
    }
    throw networkError;
  }
}


/* ══════════════════════════════════════════════════════════
   2. CUSTOM ERROR CLASS
   ══════════════════════════════════════════════════════════ */

class APIError extends Error {
  /**
   * @param {string}  message    User-facing error text
   * @param {number}  status     HTTP status code (0 = network error)
   * @param {boolean} retryable  Whether the request should be retried
   */
  constructor(message, status = 0, retryable = false) {
    super(message);
    this.name      = "APIError";
    this.status    = status;
    this.retryable = retryable;
  }
}


/* ══════════════════════════════════════════════════════════
   3. HEALTH CHECK
      Called on app startup to verify Flask is reachable.
      Falls back to direct IP if proxy fails.
   ══════════════════════════════════════════════════════════ */

/**
 * Ping the Flask backend
 * @returns {Promise<boolean>} true if reachable
 */
export async function checkHealth() {
  try {
    await apiFetch(API.ENDPOINTS.HEALTH, { method: "GET" });
    return true;
  } catch {
    // Try direct IP fallback
    try {
      const res = await fetch(
        `${API.FALLBACK_URL}${API.ENDPOINTS.HEALTH}`,
        { method: "GET" }
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}


/* ══════════════════════════════════════════════════════════
   4. CHAT  →  POST /chat
   ══════════════════════════════════════════════════════════ */

/**
 * Send a message to Mr.INIX and get an AI reply.
 *
 * @param {string} message        The user's text
 * @param {Array}  history        Full message array from state
 * @returns {Promise<string>}     The AI reply string
 *
 * Usage in ChatBox.jsx:
 *   const reply = await sendChat("Hello!", messages);
 */
export async function sendChat(message, history = []) {
  if (!message || !message.trim()) {
    throw new APIError(ERRORS.EMPTY_INPUT, 0, false);
  }

  const payload = {
    message: message.trim(),
    history: trimHistory(history),   // send last N messages as context
  };

  const data = await apiFetch(API.ENDPOINTS.CHAT, {
    method: "POST",
    body:   JSON.stringify(payload),
  });

  // Validate response shape  { "reply": "..." }
  if (!data.reply || typeof data.reply !== "string") {
    throw new APIError(
      `Unexpected response: ${JSON.stringify(data)}`,
      200,
      false
    );
  }

  return data.reply;
}


/* ══════════════════════════════════════════════════════════
   5. IMAGE  →  POST /image
   ══════════════════════════════════════════════════════════ */

/**
 * Request an AI-generated image from Flask
 *
 * @param {string} prompt    Image description
 * @returns {Promise<string>} Image URL or base64 string
 */
export async function generateImage(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new APIError("Please describe the image you want.", 0, false);
  }

  const data = await apiFetch(API.ENDPOINTS.IMAGE, {
    method: "POST",
    body:   JSON.stringify({ prompt: prompt.trim() }),
  });

  if (!data.image_url && !data.image) {
    throw new APIError("No image returned from server.", 200, false);
  }

  return data.image_url || data.image;
}


/* ══════════════════════════════════════════════════════════
   6. VOICE  →  POST /voice
      Sends audio blob from browser mic to Flask for STT
   ══════════════════════════════════════════════════════════ */

/**
 * Send an audio Blob to Flask for speech-to-text
 *
 * @param {Blob} audioBlob   Recorded audio from Web Speech API
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeVoice(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  // Voice uses FormData so we skip JSON headers
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), API.TIMEOUT_MS);

  try {
    const response = await fetch(
      `${API.BASE_URL}${API.ENDPOINTS.VOICE}`,
      {
        method: "POST",
        body:   formData,
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new APIError(ERRORS.SERVER, response.status, false);

    const data = await response.json();
    return data.transcript || data.text || "";
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") throw new APIError(ERRORS.TIMEOUT, 0, false);
    throw err instanceof APIError ? err : new APIError(ERRORS.NETWORK, 0, false);
  }
}


/* ══════════════════════════════════════════════════════════
   7. TRANSLATE  →  POST /translate
   ══════════════════════════════════════════════════════════ */

/**
 * Translate text via Flask backend
 *
 * @param {string} text           Text to translate
 * @param {string} targetLang     e.g. "es", "fr", "de", "ja"
 * @param {string} sourceLang     e.g. "en" (optional, auto-detect)
 * @returns {Promise<string>}     Translated text
 */
export async function translateText(text, targetLang = "es", sourceLang = "auto") {
  if (!text || !text.trim()) {
    throw new APIError("Please enter text to translate.", 0, false);
  }

  const data = await apiFetch(API.ENDPOINTS.TRANSLATE, {
    method: "POST",
    body:   JSON.stringify({
      text:        text.trim(),
      target_lang: targetLang,
      source_lang: sourceLang,
    }),
  });

  if (!data.translated_text && !data.result) {
    throw new APIError("No translation returned from server.", 200, false);
  }

  return data.translated_text || data.result;
}


/* ══════════════════════════════════════════════════════════
   8. UTILITY
   ══════════════════════════════════════════════════════════ */

/**
 * Promise-based sleep
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
