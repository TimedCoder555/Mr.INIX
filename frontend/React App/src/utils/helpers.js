/* ============================================================
   helpers.js  —  Mr.INIX Utility Functions
   Pure functions used across components and pages.
   No side effects — import and use anywhere safely.
   ============================================================ */

import { STORAGE, CHAT } from "./constants";


/* ══════════════════════════════════════════════════════════
   1. TIME & DATE HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Format a Date object into a chat timestamp like "12:45 PM"
 * @param {Date} date
 * @returns {string}
 */
export function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", {
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date into a chat section divider label.
 * Returns "Today", "Yesterday", or "Mon, Jun 3"
 * @param {Date} date
 * @returns {string}
 */
export function formatDateLabel(date = new Date()) {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d     = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round((today - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
  });
}

/**
 * Check if two dates are on the same calendar day
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}


/* ══════════════════════════════════════════════════════════
   2. STRING HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Capitalise first letter of a string
 * @param {string} str
 * @returns {string}
 */
export function capitalise(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to maxLength and append "…"
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str = "", maxLength = 60) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Strip leading/trailing whitespace and collapse internal
 * multiple spaces/newlines into a single space
 * @param {string} str
 * @returns {string}
 */
export function cleanInput(str = "") {
  return str.trim().replace(/\s+/g, " ");
}

/**
 * Check if a string is blank (empty or only whitespace)
 * @param {string} str
 * @returns {boolean}
 */
export function isBlank(str = "") {
  return !str || str.trim().length === 0;
}

/**
 * Build the greeting text shown on the Home screen.
 * e.g.  "Hello, Marry!\nHow can I help you today?"
 * @param {string} userName
 * @returns {{ line1: string, line2: string }}
 */
export function buildGreeting(userName = "") {
  const name  = capitalise(userName.trim()) || "there";
  const line1 = `Hello, ${name}!`;
  const line2 = "How can I help you today?";
  return { line1, line2 };
}

/**
 * Get initials from a name — "Marry Rose" → "MR", "INIX" → "IN"
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}


/* ══════════════════════════════════════════════════════════
   3. MESSAGE / CHAT HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Create a new message object
 * @param {"user"|"assistant"|"system"} role
 * @param {string} text
 * @returns {{ id, role, text, timestamp }}
 */
export function createMessage(role, text) {
  return {
    id:        generateId(),
    role,
    text:      text.trim(),
    timestamp: new Date(),
  };
}

/**
 * Trim chat history to the last N messages for API payload.
 * Keeps full history in UI but only sends recent context.
 * @param {Array} messages
 * @param {number} maxLength
 * @returns {Array}
 */
export function trimHistory(messages = [], maxLength = CHAT.MAX_HISTORY_LENGTH) {
  return messages
    .filter(m => m.role !== "system")
    .slice(-maxLength)
    .map(m => ({ role: m.role, content: m.text }));
}

/**
 * Group messages by date for rendering date separators
 * @param {Array} messages
 * @returns {Array} — [{ dateLabel, messages[] }, ...]
 */
export function groupMessagesByDate(messages = []) {
  const groups = [];

  messages.forEach(msg => {
    const msgDate = new Date(msg.timestamp);
    const last    = groups[groups.length - 1];

    if (last && isSameDay(new Date(last.date), msgDate)) {
      last.messages.push(msg);
    } else {
      groups.push({
        date:      msgDate,
        dateLabel: formatDateLabel(msgDate),
        messages:  [msg],
      });
    }
  });

  return groups;
}


/* ══════════════════════════════════════════════════════════
   4. LOCAL STORAGE HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Save a value to localStorage (serialised as JSON)
 * @param {string} key   — use STORAGE constants
 * @param {*}      value
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Mr.INIX] Could not save "${key}" to storage:`, err);
  }
}

/**
 * Load and parse a value from localStorage.
 * Returns defaultValue if key is missing or JSON is invalid.
 * @param {string} key
 * @param {*}      defaultValue
 * @returns {*}
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Remove a key from localStorage
 * @param {string} key
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Mr.INIX] Could not remove "${key}" from storage:`, err);
  }
}

/**
 * Load the saved user name from storage, with fallback
 * @returns {string}
 */
export function loadUserName() {
  return loadFromStorage(STORAGE.USER_NAME, CHAT.DEFAULT_USER_NAME);
}

/**
 * Save the user name to storage
 * @param {string} name
 */
export function saveUserName(name) {
  saveToStorage(STORAGE.USER_NAME, capitalise(name.trim()));
}

/**
 * Load saved chat history from storage
 * @returns {Array}
 */
export function loadChatHistory() {
  const raw = loadFromStorage(STORAGE.CHAT_HISTORY, []);
  // Rehydrate timestamp strings back to Date objects
  return raw.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
}

/**
 * Save chat history to storage
 * @param {Array} messages
 */
export function saveChatHistory(messages) {
  saveToStorage(STORAGE.CHAT_HISTORY, messages);
}

/**
 * Clear all Mr.INIX data from localStorage
 */
export function clearAllStorage() {
  Object.values(STORAGE).forEach(key => removeFromStorage(key));
}


/* ══════════════════════════════════════════════════════════
   5. ID GENERATOR
   ══════════════════════════════════════════════════════════ */

/**
 * Generate a short unique ID for messages and keys
 * e.g. "mrinix_1717430400000_x7k2"
 * @returns {string}
 */
export function generateId() {
  return `mrinix_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}


/* ══════════════════════════════════════════════════════════
   6. DEVICE / BROWSER HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Detect if the user is on a mobile device
 * @returns {boolean}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent);
}

/**
 * Check if the Web Speech API is available
 * @returns {boolean}
 */
export function isSpeechSupported() {
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

/**
 * Check if Speech Synthesis (text-to-speech) is available
 * @returns {boolean}
 */
export function isTTSSupported() {
  return "speechSynthesis" in window;
}

/**
 * Scroll an element to its bottom (for chat feed)
 * @param {HTMLElement} el
 * @param {boolean}     smooth
 */
export function scrollToBottom(el, smooth = true) {
  if (!el) return;
  el.scrollTo({
    top:      el.scrollHeight,
    behavior: smooth ? "smooth" : "instant",
  });
}

/**
 * Check if an element is scrolled near the bottom
 * @param {HTMLElement} el
 * @param {number}      threshold  px from bottom to count as "near"
 * @returns {boolean}
 */
export function isNearBottom(el, threshold = 120) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
}


/* ══════════════════════════════════════════════════════════
   7. DEBOUNCE
      Delay a function call until after a pause —
      used for auto-saving input drafts
   ══════════════════════════════════════════════════════════ */

/**
 * Returns a debounced version of fn
 * @param {Function} fn
 * @param {number}   delay  ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
