/* ============================================================
   constants.js  —  Mr.INIX Global Constants
   Single source of truth for every magic value in the app.
   Import from here — never hardcode values in components.
   ============================================================ */


/* ══════════════════════════════════════════════════════════
   1. APP INFO
   ══════════════════════════════════════════════════════════ */

export const APP = {
  NAME:        "Mr.INIX",
  TAGLINE:     "Your Futuristic AI Assistant",
  VERSION:     "1.0.0",
  AUTHOR:      "Mr.INIX Team",
  STATUS:      "Online",
};


/* ══════════════════════════════════════════════════════════
   2. API / NETWORK
   ══════════════════════════════════════════════════════════ */

// Your Termux Flask IP from the logs: http://192.0.0.4:5000
// CRA proxy in package.json forwards /api/* to this address.
// Change FLASK_IP if your Termux IP ever changes.

export const FLASK_IP   = "192.0.0.4";
export const FLASK_PORT = "5000";

export const API = {
  // Base URL — empty string = uses CRA proxy (recommended)
  // Set REACT_APP_API_URL in .env to override
  BASE_URL:    process.env.REACT_APP_API_URL || "",

  // Full fallback for when proxy is not working
  FALLBACK_URL: `http://${FLASK_IP}:${FLASK_PORT}`,

  // Endpoints
  ENDPOINTS: {
    CHAT:      "/chat",
    IMAGE:     "/image",
    VOICE:     "/voice",
    TRANSLATE: "/translate",
    HEALTH:    "/",
  },

  // Request config
  TIMEOUT_MS:   15000,   // 15 seconds before giving up
  RETRY_COUNT:  2,       // retry failed requests this many times
  RETRY_DELAY:  800,     // ms between retries
};


/* ══════════════════════════════════════════════════════════
   3. SUGGESTION CARDS
      The 4 action buttons on the Home screen (from screenshot)
   ══════════════════════════════════════════════════════════ */

export const SUGGESTIONS = [
  {
    id:       "image",
    label:    "Create an image",
    emoji:    "🖼️",
    prompt:   "Create an image of ",
    route:    "/chat",
    color:    "rgba(167, 139, 250, 0.15)",
  },
  {
    id:       "ideas",
    label:    "Give me ideas",
    emoji:    "💡",
    prompt:   "Give me creative ideas for ",
    route:    "/chat",
    color:    "rgba(251, 191, 36, 0.15)",
  },
  {
    id:       "task",
    label:    "Do the task",
    emoji:    "📋",
    prompt:   "Help me complete this task: ",
    route:    "/chat",
    color:    "rgba(74, 222, 128, 0.15)",
  },
  {
    id:       "translate",
    label:    "Translate the text",
    emoji:    "🌐",
    prompt:   "Translate this text: ",
    route:    "/chat",
    color:    "rgba(96, 165, 250, 0.15)",
  },
];


/* ══════════════════════════════════════════════════════════
   4. CHAT CONFIG
   ══════════════════════════════════════════════════════════ */

export const CHAT = {
  // Max characters in a single message
  MAX_INPUT_LENGTH:   2000,

  // How many messages to keep in history sent to backend
  MAX_HISTORY_LENGTH: 20,

  // Placeholder text in the input bar
  PLACEHOLDER:        "Ask me anything…",

  // Default greeting shown before user types anything
  GREETING_PREFIX:    "Hello",
  GREETING_SUFFIX:    "!\nHow can I help you today?",

  // Default user name (overridden by Settings)
  DEFAULT_USER_NAME:  "there",

  // Typing indicator delay (ms) before showing "thinking…"
  TYPING_DELAY_MS:    400,

  // Auto-scroll threshold — scroll to bottom if within this
  // many pixels of the bottom
  SCROLL_THRESHOLD_PX: 120,

  // Message roles
  ROLES: {
    USER:      "user",
    ASSISTANT: "assistant",
    SYSTEM:    "system",
  },
};


/* ══════════════════════════════════════════════════════════
   5. VOICE / SPEECH
   ══════════════════════════════════════════════════════════ */

export const VOICE = {
  // Web Speech API language
  LANG:             "en-US",

  // Max recording duration (ms) before auto-stop
  MAX_DURATION_MS:  30000,

  // Silence timeout — stop recording after this many ms of silence
  SILENCE_TIMEOUT:  2000,

  // Speech synthesis voice preference (matched by name substring)
  PREFERRED_VOICE:  "Google",
  FALLBACK_VOICE:   "Female",

  // Speech rate and pitch
  RATE:   1.0,
  PITCH:  1.0,
  VOLUME: 1.0,
};


/* ══════════════════════════════════════════════════════════
   6. ANIMATION DURATIONS (ms)
      Mirror the CSS values so JS transitions stay in sync
   ══════════════════════════════════════════════════════════ */

export const ANIM = {
  FAST:         150,
  NORMAL:       250,
  SLOW:         400,
  PAGE_ENTER:   500,
  ORB_FLOAT:    4000,   // matches orbFloat CSS duration
  ORB_GLOW:     3000,   // matches orbGlow CSS duration
  BLOB_DRIFT:   12000,  // matches blobDrift CSS duration
};


/* ══════════════════════════════════════════════════════════
   7. LOCAL STORAGE KEYS
      Never use raw strings — always use these constants.
   ══════════════════════════════════════════════════════════ */

export const STORAGE = {
  USER_NAME:    "mrinix_user_name",
  THEME:        "mrinix_theme",
  CHAT_HISTORY: "mrinix_chat_history",
  SETTINGS:     "mrinix_settings",
  VOICE_ENABLED:"mrinix_voice_enabled",
};


/* ══════════════════════════════════════════════════════════
   8. ROUTES
   ══════════════════════════════════════════════════════════ */

export const ROUTES = {
  HOME:     "/",
  CHAT:     "/chat",
  ABOUT:    "/about",
  SETTINGS: "/settings",
};


/* ══════════════════════════════════════════════════════════
   9. THEME
   ══════════════════════════════════════════════════════════ */

export const THEME = {
  DEFAULT: "light",   // "light" | "dark"

  COLORS: {
    ORB_START:   "#9b59d0",
    ORB_END:     "#6a3de8",
    ACCENT:      "#7c3aed",
    ACCENT_SOFT: "#a78bfa",
    SUCCESS:     "#4ade80",
    WARNING:     "#fbbf24",
    ERROR:       "#f87171",
  },
};


/* ══════════════════════════════════════════════════════════
   10. ERROR MESSAGES
       Consistent user-facing error strings
   ══════════════════════════════════════════════════════════ */

export const ERRORS = {
  NETWORK:     "⚠️ Cannot reach Mr.INIX server. Is Flask running?",
  TIMEOUT:     "⌛ Request timed out. Please try again.",
  SERVER:      "❌ Server error. Please try again in a moment.",
  EMPTY_INPUT: "Please type a message first.",
  VOICE_NO_SUPPORT: "🎤 Voice not supported in this browser.",
  VOICE_DENIED:     "🎤 Microphone permission denied.",
  UNKNOWN:     "Something went wrong. Please try again.",
};
