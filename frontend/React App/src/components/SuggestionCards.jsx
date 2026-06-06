/* ============================================================
   SuggestionCards.jsx  —  Mr.INIX Home Screen Action Cards
   The 4 glassmorphism cards from the screenshot:
   "Create an image" | "Give me ideas"
   "Do the task"     | "Translate the text"
   ============================================================ */

import React, { useState } from "react";
import { useNavigate }      from "react-router-dom";
import { useApp }           from "../App";
import { SUGGESTIONS, ROUTES } from "../utils/constants";
import { createMessage }    from "../utils/helpers";

/* ── Card icons using react-icons ── */
import { BsImageFill }        from "react-icons/bs";
import { IoBulbOutline }      from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineTranslate } from "react-icons/md";


/* ══════════════════════════════════════════════════════════
   ICON MAP
   Maps suggestion id → react-icon component
   ══════════════════════════════════════════════════════════ */

const ICON_MAP = {
  image:     BsImageFill,
  ideas:     IoBulbOutline,
  task:      IoDocumentTextOutline,
  translate: MdOutlineTranslate,
};

/* Accent colours per card — soft tinted backgrounds */
const COLOR_MAP = {
  image:     { bg: "rgba(167,139,250,0.18)", icon: "#8b5cf6", border: "rgba(167,139,250,0.35)" },
  ideas:     { bg: "rgba(251,191,36,0.15)",  icon: "#f59e0b", border: "rgba(251,191,36,0.30)"  },
  task:      { bg: "rgba(74,222,128,0.14)",  icon: "#22c55e", border: "rgba(74,222,128,0.28)"  },
  translate: { bg: "rgba(96,165,250,0.15)",  icon: "#3b82f6", border: "rgba(96,165,250,0.30)"  },
};


/* ══════════════════════════════════════════════════════════
   SINGLE CARD
   ══════════════════════════════════════════════════════════ */

function SuggestionCard({ suggestion, index, onSelect }) {
  const [pressed, setPressed] = useState(false);
  const Icon   = ICON_MAP[suggestion.id] || IoBulbOutline;
  const colors = COLOR_MAP[suggestion.id] || COLOR_MAP.ideas;

  return (
    <button
      className="glass-card"
      style={{
        ...s.card,
        animationDelay:  `${index * 0.08}s`,
        transform:        pressed ? "scale(0.96)" : undefined,
        borderColor:      pressed ? colors.border : undefined,
      }}
      onClick={() => onSelect(suggestion)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={()   => setPressed(false)}
      onPointerLeave={()=> setPressed(false)}
      aria-label={suggestion.label}
    >
      {/* Icon circle */}
      <div style={{
        ...s.iconWrap,
        background: colors.bg,
        border:     `1px solid ${colors.border}`,
      }}>
        <Icon size={18} color={colors.icon} />
      </div>

      {/* Label */}
      <span style={s.label}>{suggestion.label}</span>
    </button>
  );
}


/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function SuggestionCards() {
  const navigate             = useNavigate();
  const { setMessages }      = useApp();

  /**
   * When a card is tapped:
   * 1. Pre-fill the chat with the card's starter prompt
   * 2. Navigate to /chat
   */
  function handleSelect(suggestion) {
    /* Seed the chat with a user message containing the prompt */
    const seedMsg = createMessage("user", suggestion.prompt);
    setMessages([seedMsg]);
    navigate(ROUTES.CHAT);
  }

  return (
    <div style={s.wrapper}>

      {/* Section label */}
      <p style={s.sectionLabel}>What would you like to do?</p>

      {/* 2 × 2 grid matching the screenshot layout */}
      <div style={s.grid} className="anim-stagger">
        {SUGGESTIONS.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            index={index}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {
  wrapper: {
    width:   "100%",
    padding: "0 var(--space-md)",
    display: "flex",
    flexDirection: "column",
    gap:     "var(--space-sm)",
  },

  sectionLabel: {
    fontFamily:  "var(--font-body)",
    fontSize:    "0.78rem",
    fontWeight:  500,
    color:       "var(--color-text-muted)",
    textAlign:   "center",
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  /* 2-column grid — matches screenshot exactly */
  grid: {
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 "var(--space-sm)",
    width:               "100%",
  },

  /* Each card button */
  card: {
    display:        "flex",
    alignItems:     "center",
    gap:            10,
    padding:        "12px 14px",
    textAlign:      "left",
    width:          "100%",
    background:     "none",
    border:         "none",
    cursor:         "pointer",
    transition:     "transform 0.15s ease, border-color 0.15s ease",
  },

  /* Coloured icon circle */
  iconWrap: {
    width:           34,
    height:          34,
    borderRadius:    "50%",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },

  /* Card text label */
  label: {
    fontFamily:  "var(--font-body)",
    fontWeight:  500,
    fontSize:    "0.82rem",
    color:       "var(--color-text-primary)",
    lineHeight:  1.3,
    textAlign:   "left",
  },
};
