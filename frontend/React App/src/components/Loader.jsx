/* ============================================================
   Loader.jsx  —  Mr.INIX Loading Screen & Spinner
   Two exported components:
   1. <Loader />       — full-screen startup loading screen
   2. <MiniLoader />   — small inline spinner for buttons/chat
   ============================================================ */

import React, { useEffect, useState } from "react";


/* ══════════════════════════════════════════════════════════
   1. FULL-SCREEN LOADER
      Shown while App.js runs checkHealth() on startup.
      Displays animated orb + pulsing dots + status message.
   ══════════════════════════════════════════════════════════ */

export default function Loader({ message = "Starting Mr.INIX…" }) {

  /* Cycle through status messages so it feels alive */
  const steps = [
    "Starting Mr.INIX…",
    "Connecting to AI Brain…",
    "Loading your assistant…",
    "Almost ready…",
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      /* Fade out → change text → fade in */
      setVisible(false);
      setTimeout(() => {
        setStepIndex(i => (i + 1) % steps.length);
        setVisible(true);
      }, 300);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={s.wrap}>

      {/* Gradient background blobs (same as app-bg) */}
      <div style={s.blob1} />
      <div style={s.blob2} />

      {/* Central orb */}
      <div style={s.orbWrap}>
        <div style={s.orb}>
          {/* Eyes */}
          <div style={s.eyes}>
            <div style={s.eye} />
            <div style={s.eye} />
          </div>
        </div>
        {/* Orb floor shadow */}
        <div style={s.orbShadow} />
      </div>

      {/* App name */}
      <div style={s.appName}>Mr.INIX</div>
      <div style={s.appTagline}>Your Futuristic AI Assistant</div>

      {/* Animated dots */}
      <div style={s.dotsRow}>
        <span style={{ ...s.dot, animationDelay: "0.0s" }} />
        <span style={{ ...s.dot, animationDelay: "0.2s" }} />
        <span style={{ ...s.dot, animationDelay: "0.4s" }} />
      </div>

      {/* Cycling status message */}
      <div style={{
        ...s.statusMsg,
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
      }}>
        {message || steps[stepIndex]}
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes loaderOrbFloat {
          0%,100% { transform: translateY(0px);  }
          50%      { transform: translateY(-14px); }
        }
        @keyframes loaderOrbGlow {
          0%,100% { box-shadow: 0 0 40px 10px rgba(155,89,208,0.40),
                                0 0 80px 20px rgba(155,89,208,0.15); }
          50%      { box-shadow: 0 0 60px 20px rgba(155,89,208,0.65),
                                0 0 120px 40px rgba(155,89,208,0.25); }
        }
        @keyframes loaderEyeBlink {
          0%,88%,100% { transform: scaleY(1);   }
          94%          { transform: scaleY(0.08); }
        }
        @keyframes loaderShadowPulse {
          0%,100% { transform: scaleX(1);    opacity: 0.30; }
          50%      { transform: scaleX(0.78); opacity: 0.15; }
        }
        @keyframes loaderDot {
          0%,80%,100% { transform: translateY(0);   opacity: 0.35; }
          40%          { transform: translateY(-8px); opacity: 1;    }
        }
      `}</style>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   2. MINI LOADER
      Small inline spinner — use inside buttons or chat.

      Usage:
        import { MiniLoader } from "./Loader";
        <MiniLoader />
        <MiniLoader size={20} color="#7c3aed" />
   ══════════════════════════════════════════════════════════ */

export function MiniLoader({ size = 24, color = "#7c3aed" }) {
  return (
    <>
      <div style={{
        width:        size,
        height:       size,
        borderRadius: "50%",
        border:       `3px solid ${color}28`,
        borderTop:    `3px solid ${color}`,
        animation:    "miniSpin 0.75s linear infinite",
        flexShrink:   0,
      }} />
      <style>{`
        @keyframes miniSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}


/* ══════════════════════════════════════════════════════════
   3. SKELETON LOADER
      Placeholder blocks while content loads.

      Usage:
        import { Skeleton } from "./Loader";
        <Skeleton width="80%" height={16} />
   ══════════════════════════════════════════════════════════ */

export function Skeleton({ width = "100%", height = 14, borderRadius = 8, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {
  /* Full-screen wrap */
  wrap: {
    position:        "fixed",
    inset:           0,
    display:         "flex",
    flexDirection:   "column",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             12,
    background:      "linear-gradient(160deg, #dcd6f7 0%, #e8d5f5 50%, #f0e6ff 100%)",
    zIndex:          999,
    overflow:        "hidden",
    padding:         "var(--space-lg)",
  },

  /* Background blobs */
  blob1: {
    position:     "absolute",
    top:          -80, left: -80,
    width:        300, height: 300,
    borderRadius: "50%",
    background:   "radial-gradient(circle, #b8ccf8 0%, transparent 70%)",
    filter:       "blur(55px)",
    opacity:      0.55,
    pointerEvents:"none",
  },
  blob2: {
    position:     "absolute",
    bottom:       -100, right: -80,
    width:        340, height: 340,
    borderRadius: "50%",
    background:   "radial-gradient(circle, #f5c0e8 0%, transparent 70%)",
    filter:       "blur(55px)",
    opacity:      0.55,
    pointerEvents:"none",
  },

  /* Orb wrapper handles float animation */
  orbWrap: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    marginBottom:  8,
  },

  /* Main orb — matches FloatingOrb screenshot style */
  orb: {
    width:        110,
    height:       110,
    borderRadius: "50%",
    background:   "radial-gradient(circle at 35% 35%, #b97fe8, #7c3aed 60%, #4c1d95)",
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    animation:    "loaderOrbFloat 3s ease-in-out infinite, loaderOrbGlow 3s ease-in-out infinite",
    position:     "relative",
    zIndex:       1,
  },

  /* Two white eye dots */
  eyes: {
    display:  "flex",
    gap:      18,
    alignItems: "center",
  },

  eye: {
    width:        12,
    height:       20,
    borderRadius: "var(--radius-full)",
    background:   "rgba(255,255,255,0.92)",
    animation:    "loaderEyeBlink 3.5s ease-in-out infinite",
  },

  /* Shadow ellipse below orb */
  orbShadow: {
    width:        70,
    height:       14,
    borderRadius: "50%",
    background:   "rgba(100,50,200,0.22)",
    filter:       "blur(8px)",
    marginTop:    6,
    animation:    "loaderShadowPulse 3s ease-in-out infinite",
  },

  /* Text */
  appName: {
    fontFamily:   "var(--font-display)",
    fontWeight:   800,
    fontSize:     "1.9rem",
    color:        "var(--color-text-primary)",
    letterSpacing: 1,
    marginTop:    4,
  },

  appTagline: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.85rem",
    color:      "var(--color-text-secondary)",
    fontWeight: 400,
    marginTop:  2,
  },

  /* Bouncing dots */
  dotsRow: {
    display:    "flex",
    gap:        8,
    marginTop:  16,
    alignItems: "center",
  },

  dot: {
    display:       "inline-block",
    width:         8,
    height:        8,
    borderRadius:  "50%",
    background:    "linear-gradient(135deg, #a78bfa, #7c3aed)",
    animation:     "loaderDot 1.3s ease-in-out infinite",
  },

  /* Status message */
  statusMsg: {
    fontFamily:  "var(--font-body)",
    fontSize:    "0.80rem",
    color:       "var(--color-text-muted)",
    fontWeight:  400,
    marginTop:   6,
    transition:  "opacity 0.3s ease, transform 0.3s ease",
    letterSpacing: 0.3,
  },
};
