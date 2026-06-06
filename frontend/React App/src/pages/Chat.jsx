/* ============================================================
   Chat.jsx  —  Mr.INIX Full Conversation Page
   Assembles Navbar + FloatingOrb (mini) + ChatBox together.
   Orb state is driven by ChatBox events via callback.
   ============================================================ */

import React, { useState } from "react";

import Navbar        from "../components/Navbar";
import ChatBox       from "../components/ChatBox";
import FloatingOrb   from "../components/FloatingOrb";
import { ORB_STATE } from "../components/FloatingOrb";
import SettingsModal from "../components/SettingsModal";


/* ══════════════════════════════════════════════════════════
   CHAT PAGE
   ══════════════════════════════════════════════════════════ */

export default function Chat() {
  const [orbState,     setOrbState]     = useState(ORB_STATE.IDLE);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div style={s.page}>

      {/* ── Top navbar ── */}
      <Navbar onSettingsOpen={() => setSettingsOpen(true)} />

      {/* ── Mini orb header strip ── */}
      <div style={s.orbStrip} className="glass-light">
        <FloatingOrb
          orbState={orbState}
          onClick={() => {/* orb tap in chat does nothing */}}
        />
      </div>

      {/* ── Chat engine (feed + input bar) ── */}
      <div style={s.chatWrap}>
        <ChatBox onOrbStateChange={setOrbState} />
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
  page: {
    display:       "flex",
    flexDirection: "column",
    height:        "100%",
    width:         "100%",
    overflow:      "hidden",
    position:      "relative",
  },

  /* Compact orb strip between navbar and chat feed */
  orbStrip: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    padding:        "var(--space-sm) 0 var(--space-xs)",
    flexShrink:     0,
    borderBottom:   "1px solid rgba(255,255,255,0.45)",

    /* Override FloatingOrb default sizes to compact version */
    "& .orb": {
      width:  72,
      height: 72,
    },
  },

  /* ChatBox takes remaining vertical space */
  chatWrap: {
    flex:     1,
    minHeight: 0,
    overflow: "hidden",
    display:  "flex",
    flexDirection: "column",
  },
};
