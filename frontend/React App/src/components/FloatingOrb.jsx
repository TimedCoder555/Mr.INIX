/* ============================================================
   FloatingOrb.jsx  —  Mr.INIX Animated AI Orb
   The centrepiece purple orb from the screenshot.
   States: idle → listening → thinking → speaking
   ============================================================ */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../App";


/* ══════════════════════════════════════════════════════════
   ORB STATES
   ══════════════════════════════════════════════════════════ */

export const ORB_STATE = {
  IDLE:      "idle",       // floating, blinking eyes
  LISTENING: "listening",  // squish/stretch, pink tint
  THINKING:  "thinking",   // hue-rotate, slow pulse
  SPEAKING:  "speaking",   // fast glow, eyes animated
};


/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function FloatingOrb({ orbState = ORB_STATE.IDLE, onClick }) {
  const { isOnline } = useApp();
  const [blinkKey, setBlinkKey]   = useState(0);  // force re-trigger blink
  const blinkRef  = useRef(null);

  /* Random blink every 3-6 seconds in idle/speaking state */
  useEffect(() => {
    if (orbState !== ORB_STATE.IDLE && orbState !== ORB_STATE.SPEAKING) return;

    function scheduleBlink() {
      const delay = 3000 + Math.random() * 3000;
      blinkRef.current = setTimeout(() => {
        setBlinkKey(k => k + 1);
        scheduleBlink();
      }, delay);
    }

    scheduleBlink();
    return () => clearTimeout(blinkRef.current);
  }, [orbState]);

  /* ── Derive styles from orbState ── */
  const orbStyle    = getOrbStyle(orbState);
  const glowStyle   = getGlowStyle(orbState);
  const eyeStyle    = getEyeStyle(orbState, blinkKey);
  const shadowStyle = getShadowStyle(orbState);
  const wrapAnim    = getWrapAnimation(orbState);

  return (
    <div style={s.container} onClick={onClick}>

      {/* Outer glow ring */}
      <div style={{ ...s.glowRing, ...glowStyle }} />

      {/* Orb wrapper — handles float / listen / think animation */}
      <div style={{ ...s.orbWrap, ...wrapAnim }}>

        {/* Main orb sphere */}
        <div style={{ ...s.orb, ...orbStyle }}>

          {/* Specular highlight — top-left shine spot */}
          <div style={s.shine} />

          {/* Eyes row */}
          <div style={s.eyesRow}>
            <div style={{ ...s.eye, ...eyeStyle }} />
            <div style={{ ...s.eye, ...eyeStyle }} />
          </div>

          {/* Listening waveform bars (only in LISTENING state) */}
          {orbState === ORB_STATE.LISTENING && (
            <div style={s.waveRow}>
              {[10, 18, 24, 18, 10].map((h, i) => (
                <div
                  key={i}
                  style={{
                    ...s.waveBar,
                    height:         h,
                    animationDelay: `${i * 0.10}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Thinking dots (only in THINKING state) */}
          {orbState === ORB_STATE.THINKING && (
            <div style={s.thinkRow}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    ...s.thinkDot,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floor shadow */}
        <div style={{ ...s.shadow, ...shadowStyle }} />
      </div>

      {/* State label below orb */}
      <div style={s.stateLabel}>
        {getStateLabel(orbState, isOnline)}
      </div>

      {/* Injected keyframes */}
      <style>{KEYFRAMES}</style>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   STATE → STYLE MAPPERS
   ══════════════════════════════════════════════════════════ */

function getOrbStyle(state) {
  switch (state) {
    case ORB_STATE.LISTENING:
      return {
        background: "radial-gradient(circle at 35% 35%, #d87fe8, #a855f7 55%, #6d28d9)",
        animation:  "orbListen 0.6s ease-in-out infinite",
      };
    case ORB_STATE.THINKING:
      return {
        background: "radial-gradient(circle at 35% 35%, #b97fe8, #7c3aed 60%, #4c1d95)",
        animation:  "orbThink 2.5s ease-in-out infinite",
      };
    case ORB_STATE.SPEAKING:
      return {
        background: "radial-gradient(circle at 35% 35%, #c97fe8, #8b3aed 58%, #5b1d95)",
        animation:  "orbSpeak 0.8s ease-in-out infinite",
      };
    default: // IDLE
      return {
        background: "radial-gradient(circle at 35% 35%, #b97fe8, #7c3aed 60%, #4c1d95)",
        animation:  "orbFloat 4s ease-in-out infinite",
      };
  }
}

function getGlowStyle(state) {
  switch (state) {
    case ORB_STATE.LISTENING:
      return {
        background: "radial-gradient(circle, rgba(216,127,232,0.35) 0%, transparent 70%)",
        animation:  "glowPulse 0.6s ease-in-out infinite",
        transform:  "scale(1.15)",
      };
    case ORB_STATE.THINKING:
      return {
        background: "radial-gradient(circle, rgba(155,89,208,0.30) 0%, transparent 70%)",
        animation:  "glowPulse 2.5s ease-in-out infinite",
      };
    case ORB_STATE.SPEAKING:
      return {
        background: "radial-gradient(circle, rgba(180,100,232,0.40) 0%, transparent 70%)",
        animation:  "glowPulse 0.8s ease-in-out infinite",
        transform:  "scale(1.12)",
      };
    default:
      return {
        background: "radial-gradient(circle, rgba(155,89,208,0.25) 0%, transparent 70%)",
        animation:  "glowPulse 4s ease-in-out infinite",
      };
  }
}

function getEyeStyle(state, blinkKey) {
  /* In listening/thinking, eyes become smaller dots */
  if (state === ORB_STATE.LISTENING || state === ORB_STATE.THINKING) {
    return { transform: "scaleY(0.4)", transition: "transform 0.2s ease" };
  }
  /* Normal blink driven by blinkKey change */
  return {
    animation: `eyeBlink 0.15s ease ${blinkKey > 0 ? "forwards" : "none"}`,
  };
}

function getShadowStyle(state) {
  switch (state) {
    case ORB_STATE.LISTENING:
      return { animation: "shadowPulse 0.6s ease-in-out infinite" };
    case ORB_STATE.THINKING:
      return { animation: "shadowPulse 2.5s ease-in-out infinite", opacity: 0.18 };
    case ORB_STATE.SPEAKING:
      return { animation: "shadowPulse 0.8s ease-in-out infinite" };
    default:
      return { animation: "shadowPulse 4s ease-in-out infinite" };
  }
}

function getWrapAnimation(state) {
  if (state === ORB_STATE.IDLE) return {};
  /* Non-idle states handle their own animation inside getOrbStyle */
  return {};
}

function getStateLabel(state, isOnline) {
  if (!isOnline) return "⚠️ Server Offline";
  switch (state) {
    case ORB_STATE.LISTENING: return "🎤 Listening…";
    case ORB_STATE.THINKING:  return "💭 Thinking…";
    case ORB_STATE.SPEAKING:  return "🔊 Speaking…";
    default:                  return "● Online";
  }
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {
  container: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    gap:            0,
    cursor:         "pointer",
    userSelect:     "none",
    WebkitUserSelect: "none",
    position:       "relative",
  },

  /* Outer soft glow — larger than orb */
  glowRing: {
    position:     "absolute",
    width:        200,
    height:       200,
    borderRadius: "50%",
    pointerEvents:"none",
    zIndex:       0,
    transition:   "transform 0.4s ease",
  },

  orbWrap: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    position:      "relative",
    zIndex:        1,
  },

  /* Main sphere */
  orb: {
    width:          130,
    height:         130,
    borderRadius:   "50%",
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    gap:            10,
    position:       "relative",
    overflow:       "hidden",
    transition:     "background 0.5s ease",
  },

  /* Top-left specular highlight */
  shine: {
    position:     "absolute",
    top:          18,
    left:         22,
    width:        38,
    height:       24,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.28)",
    filter:       "blur(6px)",
    pointerEvents:"none",
    transform:    "rotate(-30deg)",
  },

  /* Eyes row */
  eyesRow: {
    display:    "flex",
    gap:        22,
    alignItems: "center",
    zIndex:     2,
  },

  /* Single eye */
  eye: {
    width:        13,
    height:       22,
    borderRadius: "var(--radius-full)",
    background:   "rgba(255,255,255,0.92)",
    transition:   "transform 0.15s ease",
  },

  /* Listening waveform */
  waveRow: {
    display:    "flex",
    gap:        4,
    alignItems: "center",
    zIndex:     2,
  },

  waveBar: {
    width:        4,
    borderRadius: "var(--radius-full)",
    background:   "rgba(255,255,255,0.80)",
    animation:    "waveAnim 0.6s ease-in-out infinite",
  },

  /* Thinking dots */
  thinkRow: {
    display:    "flex",
    gap:        6,
    alignItems: "center",
    zIndex:     2,
  },

  thinkDot: {
    width:         8,
    height:        8,
    borderRadius:  "50%",
    background:    "rgba(255,255,255,0.80)",
    animation:     "thinkBounce 1.2s ease-in-out infinite",
  },

  /* Floor shadow ellipse */
  shadow: {
    width:        80,
    height:       16,
    borderRadius: "50%",
    background:   "rgba(80,30,160,0.22)",
    filter:       "blur(8px)",
    marginTop:    8,
  },

  /* State label */
  stateLabel: {
    marginTop:   14,
    fontFamily:  "var(--font-body)",
    fontWeight:  500,
    fontSize:    "0.82rem",
    color:       "var(--color-text-secondary)",
    letterSpacing: 0.3,
    height:      20,
    transition:  "color 0.3s ease",
  },
};


/* ══════════════════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════════════════ */

const KEYFRAMES = `
  /* Idle float */
  @keyframes orbFloat {
    0%,100% { transform: translateY(0px)   scale(1);    }
    50%      { transform: translateY(-18px) scale(1.03); }
  }

  /* Thinking hue shift */
  @keyframes orbThink {
    0%,100% { filter: hue-rotate(0deg)  brightness(1);    }
    50%      { filter: hue-rotate(35deg) brightness(1.18); }
  }

  /* Listening squish */
  @keyframes orbListen {
    0%,100% { transform: scale(1,    1)    translateY(0);  }
    25%      { transform: scale(1.06,0.94) translateY(4px); }
    50%      { transform: scale(0.94,1.06) translateY(-6px);}
    75%      { transform: scale(1.04,0.96) translateY(2px); }
  }

  /* Speaking fast pulse */
  @keyframes orbSpeak {
    0%,100% { transform: scale(1);    }
    50%      { transform: scale(1.05); }
  }

  /* Glow ring pulse */
  @keyframes glowPulse {
    0%,100% { opacity: 0.7; transform: scale(1);    }
    50%      { opacity: 1;   transform: scale(1.12); }
  }

  /* Shadow sync with float */
  @keyframes shadowPulse {
    0%,100% { transform: scaleX(1);    opacity: 0.28; }
    50%      { transform: scaleX(0.78); opacity: 0.14; }
  }

  /* Eye blink */
  @keyframes eyeBlink {
    0%   { transform: scaleY(1);    }
    40%  { transform: scaleY(0.08); }
    100% { transform: scaleY(1);    }
  }

  /* Listening waveform bars */
  @keyframes waveAnim {
    0%,100% { transform: scaleY(1);   opacity: 0.6; }
    50%      { transform: scaleY(1.8); opacity: 1;   }
  }

  /* Thinking bounce dots */
  @keyframes thinkBounce {
    0%,80%,100% { transform: translateY(0);   opacity: 0.4; }
    40%          { transform: translateY(-7px); opacity: 1;   }
  }
`;
