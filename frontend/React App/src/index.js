/* ============================================================
   index.js  —  Mr.INIX React Entry Point
   The very first JS file CRA loads. Mounts React into
   the #root div defined in public/index.html
   ============================================================ */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/* ── Global Styles (order matters — cascade top to bottom) ── */
import "./styles/global.css";       // CSS variables, reset, bg gradient
import "./styles/animations.css";   // All @keyframes
import "./styles/glass.css";        // Glassmorphism component classes
import "./styles/chat.css";         // Chat page layout classes

/* ══════════════════════════════════════════════════════════
   Mount React
   ══════════════════════════════════════════════════════════ */

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
