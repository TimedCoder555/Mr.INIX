/* ============================================================
   Home.jsx  —  Mr.INIX Main Home Screen
   Matches the screenshot exactly:
   - Navbar top bar
   - "Hello, [name]! / How can I help you today?" greeting
   - Floating animated orb (centrepiece)
   - 2×2 suggestion cards
   - "Ask me anything…" input bar at bottom
   ============================================================ */

import React, { useState, useRef } from "react";
import { useNavigate }              from "react-router-dom";

import { useApp }           from "../App";
import { buildGreeting }    from "../utils/helpers";
import { ROUTES, CHAT }     from "../utils/constants";

import Navbar               from "../components/Navbar";
import FloatingOrb          from "../components/FloatingOrb";
import { ORB_STATE }        from "../components/FloatingOrb";
import SuggestionCards      from "../components/SuggestionCards";
import VoiceButton          from "../components/VoiceButton";
import SettingsModal        from "../components/SettingsModal";

/* ── Icons ── */
import { IoAdd }   from "react-icons/io5";
import { IoSend }  from "react-icons/io5";


/* ══════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════ */

export default function Home() {
  const navigate                  = useNavigate();
  const { userName, setMessages } = useApp();

  /* Local state */
  const [orbState,      setOrbState]      = useState(ORB_STATE.IDLE);
  const [inputText,     setInputText]     = useState("");
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const inputRef = useRef(null);

  /* Build greeting from saved user name */
  const { line1, line2 } = buildGreeting(userName);


  /* ── Navigate to chat with optional seed text ── */
  function goToChat(seedText = "") {
    if (seedText.trim()) {
      const { createMessage } = require("../utils/helpers");
      setMessages([{ ...createMessage("user", seedText), _sent: true }]);
    }
    navigate(ROUTES.CHAT);
  }


  /* ── Quick-send from home input bar ── */
  function handleHomeSend() {
    const text = inputText.trim();
    if (!text) {
      /* If empty — just open chat */
      navigate(ROUTES.CHAT);
      return;
    }
    goToChat(text);
  }


  /* ── Enter key in home input ── */
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleHomeSend();
    }
  }


  /* ── Voice transcript from home screen ── */
  function handleVoiceTranscript(transcript) {
    if (transcript.trim()) {
      goToChat(transcript);
    }
  }


  /* ── Orb tap → go to chat ── */
  function handleOrbClick() {
    navigate(ROUTES.CHAT);
  }


  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div style={s.page}>

      {/* ── Top navbar ── */}
      <Navbar onSettingsOpen={() => setSettingsOpen(true)} />

      {/* ── Scrollable body ── */}
      <div style={s.body} className="scroll-y">

        {/* ── Greeting ── */}
        <div style={s.greetingWrap} className="anim-fade-up">
          <h1 style={s.greetLine1}>{line1}</h1>
          <h2 style={s.greetLine2}>{line2}</h2>
        </div>

        {/* ── Floating Orb ── */}
        <div style={s.orbSection}>
          <FloatingOrb
            orbState={orbState}
            onClick={handleOrbClick}
          />
        </div>

        {/* ── Suggestion Cards ── */}
        <div style={s.cardsSection}>
          <SuggestionCards />
        </div>

      </div>

      {/* ── Bottom input bar (fixed) ── */}
      <div style={s.inputArea}>
        <div className="glass-input-bar" style={s.inputBar}>

          {/* "+" attach icon */}
          <button
            style={s.attachBtn}
            aria-label="More options"
            onClick={() => navigate(ROUTES.CHAT)}
          >
            <IoAdd size={20} color="var(--color-text-muted)" />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            style={s.textInput}
            placeholder={CHAT.PLACEHOLDER}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              /* On mobile, opening keyboard may scroll — go straight to chat */
              if (window.innerWidth < 480) {
                inputRef.current?.blur();
                navigate(ROUTES.CHAT);
              }
            }}
            maxLength={CHAT.MAX_INPUT_LENGTH}
            aria-label="Ask Mr.INIX anything"
          />

          {/* Voice button */}
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            onStateChange={isListening =>
              setOrbState(isListening ? ORB_STATE.LISTENING : ORB_STATE.IDLE)
            }
          />

          {/* Send button — only visible when text entered */}
          {inputText.trim().length > 0 && (
            <button
              style={s.sendBtn}
              onClick={handleHomeSend}
              aria-label="Send"
            >
              <IoSend size={16} color="#fff" />
            </button>
          )}

        </div>
      </div>

      {/* ── Settings modal ── */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {

  /* Full-height flex column */
  page: {
    display:        "flex",
    flexDirection:  "column",
    height:         "100%",
    width:          "100%",
    overflow:       "hidden",
    position:       "relative",
  },

  /* Scrollable middle section */
  body: {
    flex:           1,
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    overflowY:      "auto",
    padding:        "var(--space-lg) 0 var(--space-sm)",
    gap:            0,
  },

  /* ── Greeting ── */
  greetingWrap: {
    textAlign:    "center",
    padding:      "0 var(--space-lg)",
    marginBottom: "var(--space-lg)",
    animationDelay: "0.05s",
  },

  greetLine1: {
    fontFamily:  "var(--font-display)",
    fontWeight:  700,
    fontSize:    "clamp(1.5rem, 5vw, 2rem)",
    color:       "var(--color-text-primary)",
    lineHeight:  1.2,
    /* Matches screenshot — "Hello, Marry!" in bold dark purple */
  },

  greetLine2: {
    fontFamily:  "var(--font-display)",
    fontWeight:  700,
    fontSize:    "clamp(1.2rem, 4vw, 1.6rem)",
    color:       "var(--color-text-primary)",
    lineHeight:  1.3,
    marginTop:   4,
    opacity:     0.85,
  },

  /* ── Orb section ── */
  orbSection: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flex:           1,
    minHeight:      220,
    padding:        "var(--space-md) 0",
    animationDelay: "0.12s",
  },

  /* ── Cards section ── */
  cardsSection: {
    width:      "100%",
    paddingBottom: "var(--space-sm)",
    animationDelay: "0.20s",
  },

  /* ── Bottom input area ── */
  inputArea: {
    flexShrink:    0,
    padding:       "var(--space-sm) var(--space-md) var(--space-md)",
    animation:     "slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
    animationDelay:"0.25s",
  },

  inputBar: {
    display:     "flex",
    alignItems:  "center",
    gap:         8,
    padding:     "8px 8px 8px 14px",
  },

  attachBtn: {
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    width:           32,
    height:          32,
    borderRadius:    "50%",
    background:      "rgba(139,100,220,0.10)",
    border:          "1px solid rgba(139,100,220,0.18)",
    cursor:          "pointer",
    flexShrink:      0,
    transition:      "background var(--transition-fast)",
  },

  textInput: {
    flex:        1,
    background:  "transparent",
    border:      "none",
    outline:     "none",
    fontFamily:  "var(--font-body)",
    fontSize:    "0.92rem",
    color:       "var(--color-text-primary)",
    minWidth:    0,
  },

  sendBtn: {
    width:           38,
    height:          38,
    borderRadius:    "50%",
    border:          "none",
    background:      "linear-gradient(135deg,#a78bfa,#7c3aed)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    cursor:          "pointer",
    flexShrink:      0,
    boxShadow:       "0 4px 14px rgba(124,58,237,0.38)",
    animation:       "scaleIn 0.2s ease both",
    transition:      "transform 0.15s ease",
  },
};
