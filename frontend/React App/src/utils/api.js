// ============================================================
// utils/api.js  —  Mr.INIX Frontend ↔ Flask Bridge
// ============================================================
//
// HOW THE URL IS CHOSEN (in priority order):
//
//  1. VITE_API_URL env variable  →  set in .env for production
//  2. Same host as the React app →  works when Flask serves React
//     OR when Vite proxy is configured
//  3. Auto-detect LAN IP         →  best for Termux / mobile dev
//
// For Termux / Android development:
//   - Find your LAN IP:  ip addr | grep "inet 192"
//   - Create a .env file in your React project root:
//       VITE_API_URL=http://192.168.x.x:5000
//   - Then restart Vite: npm run dev -- --host
//
// ============================================================

function getBackendURL() {
  // 1. Explicit env variable (highest priority — use this in production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ""); // strip trailing slash
  }

  // 2. Same origin — works when Vite proxy is set up OR Flask serves the build
  //    In vite.config.js add:
  //      server: { proxy: { '/chat': 'http://localhost:5000' } }
  if (import.meta.env.DEV) {
    // 3. Auto-detect: use the same host the browser loaded the page from,
    //    but swap port to 5000. Works perfectly on Termux / LAN.
    return `http://${window.location.hostname}:5000`;
  }

  // Production fallback — same origin (Flask must serve the React build)
  return "";
}

const BASE_URL = getBackendURL();

// ─── Main export ────────────────────────────────────────────

/**
 * Send a message to Mr.INIX backend and return the AI reply string.
 * Throws a descriptive Error on any network or server problem.
 *
 * @param {string} message   The user's text
 * @returns {Promise<string>} The assistant's reply
 */
export async function sendMessage(message) {
  const url = `${BASE_URL}/chat`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ message }),
    });
  } catch (networkErr) {
    // fetch() itself threw — server unreachable
    throw new Error(
      `Cannot reach backend at ${url}. ` +
        `Is Flask running? (${networkErr.message})`
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody.error || errBody.message || JSON.stringify(errBody);
    } catch {
      detail = await response.text().catch(() => "");
    }
    throw new Error(
      `Server returned ${response.status}: ${detail || response.statusText}`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Backend returned invalid JSON.");
  }

  if (!data.reply) {
    throw new Error(
      `Unexpected response shape: ${JSON.stringify(data)}. ` +
        `Backend must return { "reply": "..." }`
    );
  }

  return data.reply;
}
