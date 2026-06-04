/* ============================================================
   App.js  —  Mr.INIX Root Component
   Handles routing, global state, health check on startup,
   and wraps every page in the animated gradient background.
   ============================================================ */

import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ── Pages ── */
import Home     from "./pages/Home";
import Chat     from "./pages/Chat";
import About    from "./pages/About";
import Settings from "./pages/Settings";

/* ── Components ── */
import Loader from "./components/Loader";

/* ── Utils ── */
import { checkHealth }                    from "./utils/api";
import { loadUserName, loadChatHistory,
         saveChatHistory, saveUserName }   from "./utils/helpers";
import { ROUTES, STORAGE }                from "./utils/constants";


/* ══════════════════════════════════════════════════════════
   1. GLOBAL APP CONTEXT
      Shared state passed down to every page/component
      without prop-drilling.
   ══════════════════════════════════════════════════════════ */

const AppContext = createContext(null);

/**
 * Custom hook — use anywhere inside the app:
 *   const { userName, messages, setMessages } = useApp();
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <App />");
  return ctx;
}


/* ══════════════════════════════════════════════════════════
   2. APP COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function App() {

  /* ── Global state ─────────────────────────────────────── */
  const [userName,    setUserNameState] = useState(() => loadUserName());
  const [messages,    setMessages]      = useState(() => loadChatHistory());
  const [isLoading,   setIsLoading]     = useState(true);   // startup check
  const [isOnline,    setIsOnline]      = useState(false);  // Flask reachable?
  const [voiceEnabled,setVoiceEnabled]  = useState(false);

  /* ── Startup: health-check Flask ─────────────────────── */
  useEffect(() => {
    let mounted = true;

    async function startup() {
      const healthy = await checkHealth();
      if (!mounted) return;
      setIsOnline(healthy);
      setIsLoading(false);

      if (!healthy) {
        console.warn(
          "[Mr.INIX] Flask backend unreachable.\n" +
          "Make sure you ran: python app.py\n" +
          "Expected at: http://192.0.0.4:5000"
        );
      }
    }

    startup();
    return () => { mounted = false; };
  }, []);

  /* ── Persist chat history whenever messages change ───── */
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  /* ── userName setter that also persists to storage ───── */
  function setUserName(name) {
    setUserNameState(name);
    saveUserName(name);
  }

  /* ── Clear all chat history ──────────────────────────── */
  function clearHistory() {
    setMessages([]);
  }

  /* ── Context value passed to all children ────────────── */
  const contextValue = {
    userName,
    setUserName,
    messages,
    setMessages,
    isOnline,
    voiceEnabled,
    setVoiceEnabled,
    clearHistory,
  };

  /* ── Startup loader ──────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="app-bg">
        <Loader message="Starting Mr.INIX…" />
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────── */
  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <div className="app-bg">
          <Routes>

            {/* Home — orb + greeting + suggestion cards */}
            <Route
              path={ROUTES.HOME}
              element={<Home />}
            />

            {/* Chat — full conversation page */}
            <Route
              path={ROUTES.CHAT}
              element={<Chat />}
            />

            {/* About */}
            <Route
              path={ROUTES.ABOUT}
              element={<About />}
            />

            {/* Settings */}
            <Route
              path={ROUTES.SETTINGS}
              element={<Settings />}
            />

            {/* Catch-all → redirect to home */}
            <Route
              path="*"
              element={<Navigate to={ROUTES.HOME} replace />}
            />

          </Routes>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
