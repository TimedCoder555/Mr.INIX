/* ============================================================
   About.jsx  —  Mr.INIX About Page
   Shows app info, features, tech stack, and credits.
   Glassmorphism cards, staggered fade-up animations.
   ============================================================ */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp }      from "../App";
import { APP, ROUTES } from "../utils/constants";
import Navbar          from "../components/Navbar";

/* ── Icons ── */
import { IoSparkles }        from "react-icons/io5";
import { IoChatbubblesOutline } from "react-icons/io5";
import { IoMicOutline }      from "react-icons/io5";
import { IoImageOutline }    from "react-icons/io5";
import { IoLanguageOutline } from "react-icons/io5";
import { IoFlashOutline }    from "react-icons/io5";
import { IoLogoGithub }      from "react-icons/io5";
import { IoRocketOutline }   from "react-icons/io5";
import { IoBrainOutline }    from "react-icons/io5";


/* ══════════════════════════════════════════════════════════
   FEATURE CARD
   ══════════════════════════════════════════════════════════ */

function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div
      className="glass-card anim-fade-up"
      style={{ ...s.featureCard, animationDelay: delay }}
    >
      <div style={{ ...s.featureIcon, background: color }}>
        {icon}
      </div>
      <div style={s.featureText}>
        <div style={s.featureTitle}>{title}</div>
        <div style={s.featureDesc}>{desc}</div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   TECH BADGE
   ══════════════════════════════════════════════════════════ */

function TechBadge({ label, color }) {
  return (
    <div style={{ ...s.badge, borderColor: color, color }}>
      {label}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   ABOUT PAGE
   ══════════════════════════════════════════════════════════ */

export default function About() {
  const navigate     = useNavigate();
  const { isOnline } = useApp();

  const features = [
    {
      icon:  <IoChatbubblesOutline size={18} color="#fff" />,
      title: "AI Chat",
      desc:  "Context-aware conversations powered by your Python AI brain",
      color: "linear-gradient(135deg,#a78bfa,#7c3aed)",
      delay: "0.05s",
    },
    {
      icon:  <IoMicOutline size={18} color="#fff" />,
      title: "Voice Input",
      desc:  "Speak naturally using Web Speech API — no extra app needed",
      color: "linear-gradient(135deg,#f472b6,#db2777)",
      delay: "0.10s",
    },
    {
      icon:  <IoImageOutline size={18} color="#fff" />,
      title: "Image Generation",
      desc:  "Create AI-generated images from text descriptions",
      color: "linear-gradient(135deg,#60a5fa,#2563eb)",
      delay: "0.15s",
    },
    {
      icon:  <IoLanguageOutline size={18} color="#fff" />,
      title: "Translation",
      desc:  "Translate text between dozens of languages instantly",
      color: "linear-gradient(135deg,#34d399,#059669)",
      delay: "0.20s",
    },
    {
      icon:  <IoFlashOutline size={18} color="#fff" />,
      title: "Task Assistant",
      desc:  "Get help completing any task — writing, coding, planning",
      color: "linear-gradient(135deg,#fbbf24,#d97706)",
      delay: "0.25s",
    },
    {
      icon:  <IoBrainOutline size={18} color="#fff" />,
      title: "AI Memory",
      desc:  "Remembers context across your conversation session",
      color: "linear-gradient(135deg,#c084fc,#9333ea)",
      delay: "0.30s",
    },
  ];

  const techStack = [
    { label: "React 18",      color: "#60a5fa" },
    { label: "Python Flask",  color: "#34d399" },
    { label: "Web Speech API",color: "#f472b6" },
    { label: "SQLite",        color: "#fbbf24" },
    { label: "Framer Motion", color: "#a78bfa" },
    { label: "react-icons",   color: "#60a5fa" },
    { label: "flask-cors",    color: "#34d399" },
    { label: "CSS Glass",     color: "#c084fc" },
  ];

  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Scrollable body ── */}
      <div style={s.body} className="scroll-y">

        {/* ── Hero section ── */}
        <div style={s.hero} className="anim-fade-up">

          {/* Orb avatar */}
          <div style={s.heroOrb}>
            <div style={s.heroOrbInner}>M</div>
            <div style={s.heroOrbGlow} />
          </div>

          <h1 style={s.heroName}>{APP.NAME}</h1>
          <p  style={s.heroTagline}>{APP.TAGLINE}</p>

          {/* Version + status */}
          <div style={s.heroBadges}>
            <div style={s.versionBadge}>v{APP.VERSION}</div>
            <div style={{
              ...s.statusBadge,
              background: isOnline
                ? "rgba(74,222,128,0.15)"
                : "rgba(248,113,113,0.15)",
              color: isOnline ? "#4ade80" : "#f87171",
              borderColor: isOnline
                ? "rgba(74,222,128,0.35)"
                : "rgba(248,113,113,0.35)",
            }}>
              <span style={{
                ...s.statusDot,
                background:  isOnline ? "#4ade80" : "#f87171",
                boxShadow:   isOnline
                  ? "0 0 6px rgba(74,222,128,0.8)"
                  : "0 0 6px rgba(248,113,113,0.8)",
              }} />
              {isOnline ? "AI Online" : "AI Offline"}
            </div>
          </div>

          {/* Short description */}
          <p style={s.heroDesc}>
            Mr.INIX is a full-stack AI assistant built with React and
            Python Flask. It runs locally on your device — your data
            stays private.
          </p>
        </div>

        {/* ── Features ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <IoSparkles size={16} color="#a78bfa" />
            <span style={s.sectionTitle}>Features</span>
          </div>
          <div style={s.featureGrid}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>

        {/* ── Tech stack ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <IoRocketOutline size={16} color="#a78bfa" />
            <span style={s.sectionTitle}>Tech Stack</span>
          </div>
          <div
            className="glass anim-fade-up"
            style={{ ...s.techCard, animationDelay: "0.15s" }}
          >
            <div style={s.badgeRow}>
              {techStack.map((t, i) => (
                <TechBadge key={i} {...t} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Architecture ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <IoBrainOutline size={16} color="#a78bfa" />
            <span style={s.sectionTitle}>Architecture</span>
          </div>
          <div
            className="glass anim-fade-up"
            style={{ ...s.archCard, animationDelay: "0.20s" }}
          >
            {[
              { arrow: "", label: "React Frontend  (port 3000)" },
              { arrow: "↕", label: "HTTP POST  /chat  /image  /voice" },
              { arrow: "", label: "Flask Backend  (port 5000)" },
              { arrow: "↕", label: "AI Processing  +  SQLite Memory" },
              { arrow: "", label: "AI Response  →  React UI" },
            ].map((row, i) => (
              <div key={i} style={{
                ...s.archRow,
                fontWeight: row.arrow ? 400 : 600,
                color: row.arrow
                  ? "var(--color-text-muted)"
                  : "var(--color-text-primary)",
                fontSize: row.arrow ? "0.75rem" : "0.88rem",
                padding: row.arrow ? "2px 0" : "6px 0",
              }}>
                {row.arrow && (
                  <span style={s.archArrow}>{row.arrow}</span>
                )}
                {!row.arrow && (
                  <span style={s.archDot} />
                )}
                {row.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={s.ctaSection}>
          <button
            className="glass-card"
            style={s.ctaBtn}
            onClick={() => navigate(ROUTES.CHAT)}
          >
            <IoChatbubblesOutline size={18} color="#7c3aed" />
            <span style={s.ctaLabel}>Start Chatting</span>
          </button>

          <button
            className="glass-card"
            style={s.ctaBtn}
            onClick={() => navigate(ROUTES.SETTINGS)}
          >
            <IoLogoGithub size={18} color="#7c3aed" />
            <span style={s.ctaLabel}>Settings</span>
          </button>
        </div>

        {/* ── Footer ── */}
        <div style={s.footer}>
          Built with ❤️ · {APP.NAME} {APP.VERSION} · 2025
        </div>

      </div>
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
  },

  body: {
    flex:    1,
    padding: "var(--space-md) var(--space-md) var(--space-2xl)",
    display: "flex",
    flexDirection: "column",
    gap:     "var(--space-lg)",
  },

  /* ── Hero ── */
  hero: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    textAlign:      "center",
    gap:            8,
    padding:        "var(--space-md) 0",
  },

  heroOrb: {
    position:  "relative",
    marginBottom: 8,
  },

  heroOrbInner: {
    width:           80,
    height:          80,
    borderRadius:    "50%",
    background:      "radial-gradient(circle at 35% 35%, #b97fe8, #7c3aed 60%, #4c1d95)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontFamily:      "var(--font-display)",
    fontWeight:      800,
    fontSize:        "2rem",
    color:           "#fff",
    position:        "relative",
    zIndex:          1,
    animation:       "orbFloat 4s ease-in-out infinite",
  },

  heroOrbGlow: {
    position:     "absolute",
    inset:        -16,
    borderRadius: "50%",
    background:   "radial-gradient(circle, rgba(155,89,208,0.30) 0%, transparent 70%)",
    animation:    "glowPulse 4s ease-in-out infinite",
    zIndex:       0,
  },

  heroName: {
    fontFamily:   "var(--font-display)",
    fontWeight:   800,
    fontSize:     "1.8rem",
    color:        "var(--color-text-primary)",
    letterSpacing: 1,
  },

  heroTagline: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.88rem",
    color:      "var(--color-text-secondary)",
    fontWeight: 400,
  },

  heroBadges: {
    display:    "flex",
    gap:        8,
    alignItems: "center",
    marginTop:  4,
  },

  versionBadge: {
    padding:      "3px 10px",
    borderRadius: "var(--radius-full)",
    background:   "rgba(139,100,220,0.12)",
    border:       "1px solid rgba(139,100,220,0.25)",
    fontSize:     "0.72rem",
    fontWeight:   600,
    color:        "#8b5cf6",
    fontFamily:   "var(--font-body)",
  },

  statusBadge: {
    display:      "flex",
    alignItems:   "center",
    gap:          5,
    padding:      "3px 10px",
    borderRadius: "var(--radius-full)",
    border:       "1px solid",
    fontSize:     "0.72rem",
    fontWeight:   600,
    fontFamily:   "var(--font-body)",
  },

  statusDot: {
    width:        6,
    height:       6,
    borderRadius: "50%",
    flexShrink:   0,
  },

  heroDesc: {
    fontFamily:  "var(--font-body)",
    fontSize:    "0.84rem",
    color:       "var(--color-text-secondary)",
    lineHeight:  1.65,
    maxWidth:    320,
    marginTop:   4,
  },

  /* ── Section ── */
  section: {
    display:       "flex",
    flexDirection: "column",
    gap:           "var(--space-sm)",
  },

  sectionHeader: {
    display:     "flex",
    alignItems:  "center",
    gap:         6,
  },

  sectionTitle: {
    fontFamily:   "var(--font-display)",
    fontWeight:   700,
    fontSize:     "1rem",
    color:        "var(--color-text-primary)",
    letterSpacing: 0.3,
  },

  /* ── Feature cards ── */
  featureGrid: {
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 "var(--space-sm)",
  },

  featureCard: {
    display:       "flex",
    flexDirection: "column",
    gap:           8,
    padding:       "var(--space-md)",
  },

  featureIcon: {
    width:           36,
    height:          36,
    borderRadius:    "var(--radius-sm)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },

  featureText: {
    display:       "flex",
    flexDirection: "column",
    gap:           3,
  },

  featureTitle: {
    fontFamily:  "var(--font-display)",
    fontWeight:  600,
    fontSize:    "0.85rem",
    color:       "var(--color-text-primary)",
  },

  featureDesc: {
    fontFamily:  "var(--font-body)",
    fontSize:    "0.72rem",
    color:       "var(--color-text-muted)",
    lineHeight:  1.5,
  },

  /* ── Tech stack ── */
  techCard: {
    padding:  "var(--space-md)",
  },

  badgeRow: {
    display:   "flex",
    flexWrap:  "wrap",
    gap:       8,
  },

  badge: {
    padding:      "4px 10px",
    borderRadius: "var(--radius-full)",
    border:       "1px solid",
    fontSize:     "0.72rem",
    fontWeight:   600,
    fontFamily:   "var(--font-body)",
    background:   "rgba(255,255,255,0.30)",
  },

  /* ── Architecture ── */
  archCard: {
    padding:       "var(--space-md)",
    display:       "flex",
    flexDirection: "column",
  },

  archRow: {
    display:    "flex",
    alignItems: "center",
    gap:        10,
    fontFamily: "var(--font-body)",
  },

  archArrow: {
    color:      "#a78bfa",
    fontWeight: 700,
    fontSize:   "0.88rem",
    width:      14,
    textAlign:  "center",
  },

  archDot: {
    width:        8,
    height:       8,
    borderRadius: "50%",
    background:   "linear-gradient(135deg,#a78bfa,#7c3aed)",
    flexShrink:   0,
  },

  /* ── CTA ── */
  ctaSection: {
    display: "flex",
    gap:     "var(--space-sm)",
  },

  ctaBtn: {
    flex:        1,
    display:     "flex",
    alignItems:  "center",
    justifyContent: "center",
    gap:         8,
    padding:     "var(--space-md)",
  },

  ctaLabel: {
    fontFamily:  "var(--font-display)",
    fontWeight:  600,
    fontSize:    "0.88rem",
    color:       "var(--color-text-primary)",
  },

  /* ── Footer ── */
  footer: {
    textAlign:   "center",
    fontFamily:  "var(--font-body)",
    fontSize:    "0.72rem",
    color:       "var(--color-text-muted)",
    paddingTop:  "var(--space-sm)",
  },
};
