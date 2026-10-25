/* ============================================================
   Settings.jsx  —  Mr.INIX Full Settings Page
   Full-page version of SettingsModal — accessible via /settings
   route. Same sections but with more breathing room and
   additional options suited to Termux/Android development.
   ============================================================ */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate }  from "react-router-dom";

import { useApp }       from "../App";
import Navbar           from "../components/Navbar";
import { MiniLoader }   from "../components/Loader";
import { checkHealth }  from "../utils/api";
import {
  saveToStorage,
  loadFromStorage,
  clearAllStorage,
  capitalise,
  loadUserName,
}                       from "../utils/helpers";
import {
  APP, FLASK_IP, FLASK_PORT,
  STORAGE, ROUTES, VOICE,
}                       from "../utils/constants";

/* ── Icons ── */
import { IoPerson }              from "react-icons/io5";
import { IoMicOutline }          from "react-icons/io5";
import { IoTrashOutline }        from "react-icons/io5";
import { IoServerOutline }       from "react-icons/io5";
import { IoColorPaletteOutline } from "react-icons/io5";
import { IoNotificationsOutline }from "react-icons/io5";
import { IoShieldOutline }       from "react-icons/io5";
import { IoCheckmarkCircle }     from "react-icons/io5";
import { IoAlertCircle }         from "react-icons/io5";
import { IoRefreshOutline }      from "react-icons/io5";
import { IoInformationCircle }   from "react-icons/io5";
import { IoChatbubblesOutline }  from "react-icons/io5";


/* ══════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ══════════════════════════════════════════════════════════ */

function SectionHeader({ title }) {
  return <p style={s.sectionTitle}>{title}</p>;
}

function SettingRow({ icon, label, sublabel, children, danger, last }) {
  return (
    <div style={{
      ...s.row,
      borderBottom: last ? "none" : "1px solid rgba(139,100,220,0.08)",
    }}>
      <div style={{
        ...s.rowIcon,
        background: danger
          ? "rgba(248,113,113,0.12)"
          : "rgba(139,100,220,0.10)",
        color: danger ? "#f87171" : "#8b5cf6",
      }}>
        {icon}
      </div>
      <div style={s.rowLabels}>
        <span style={{
          ...s.rowLabel,
          color: danger ? "#f87171" : "var(--color-text-primary)",
        }}>
          {label}
        </span>
        {sublabel && <span style={s.rowSublabel}>{sublabel}</span>}
      </div>
      <div style={s.rowControl}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        ...s.toggle,
        background:     value
          ? "linear-gradient(135deg,#a78bfa,#7c3aed)"
          : "rgba(139,100,220,0.15)",
        justifyContent: value ? "flex-end" : "flex-start",
      }}
    >
      <div style={s.toggleThumb} />
    </button>
  );
}

function SavedBadge({ show }) {
  if (!show) return null;
  return (
    <span style={s.savedBadge}>
      <IoCheckmarkCircle size={13} /> Saved
    </span>
  );
}


/* ══════════════════════════════════════════════════════════
   SETTINGS PAGE
   ══════════════════════════════════════════════════════════ */

export default function Settings() {
  const navigate = useNavigate();
  const {
    userName, setUserName,
    voiceEnabled, setVoiceEnabled,
    clearHistory, isOnline,
  } = useApp();

  /* ── Local state ── */
  const [nameInput,     setNameInput]     = useState(userName);
  const [ipInput,       setIpInput]       = useState(
    loadFromStorage("mrinix_custom_ip", `${FLASK_IP}:${FLASK_PORT}`)
  );
  const [pingStatus,    setPingStatus]    = useState(null);
  const [pinging,       setPinging]       = useState(false);
  const [savedName,     setSavedName]     = useState(false);
  const [savedIP,       setSavedIP]       = useState(false);
  const [confirmClear,  setConfirmClear]  = useState(false);
  const [confirmReset,  setConfirmReset]  = useState(false);
  const [soundEnabled,  setSoundEnabled]  = useState(
    loadFromStorage("mrinix_sound", true)
  );
  const [autoScroll,    setAutoScroll]    = useState(
    loadFromStorage("mrinix_autoscroll", true)
  );
  const [fontSize,      setFontSize]      = useState(
    loadFromStorage("mrinix_fontsize", "medium")
  );
  const nameRef = useRef(null);

  /* Focus name on mount */
  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 300);
  }, []);

  /* ── Handlers ── */
  function handleSaveName() {
    const clean = capitalise(nameInput.trim());
    if (!clean) return;
    setUserName(clean);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2500);
  }

  function handleSaveIP() {
    saveToStorage("mrinix_custom_ip", ipInput.trim());
    setSavedIP(true);
    setTimeout(() => setSavedIP(false), 2500);
  }

  async function handlePing() {
    setPinging(true);
    setPingStatus(null);
    const ok = await checkHealth();
    setPingStatus(ok ? "ok" : "fail");
    setPinging(false);
  }

  function handleSoundToggle(val) {
    setSoundEnabled(val);
    saveToStorage("mrinix_sound", val);
  }

  function handleAutoScrollToggle(val) {
    setAutoScroll(val);
    saveToStorage("mrinix_autoscroll", val);
  }

  function handleFontSize(size) {
    setFontSize(size);
    saveToStorage("mrinix_fontsize", size);
  }

  function handleClearHistory() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearHistory();
    setConfirmClear(false);
    navigate(ROUTES.HOME);
  }

  function handleFactoryReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    clearAllStorage();
    window.location.href = ROUTES.HOME;
  }

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Scrollable body ── */}
      <div style={s.body} className="scroll-y">

        {/* ─────────────────────────────────────
            SECTION 1 — PROFILE
            ───────────────────────────────────── */}
        <div className="glass" style={s.card}>
          <SectionHeader title="👤  PROFILE" />

          <SettingRow
            icon={<IoPerson size={16} />}
            label="Display Name"
            sublabel="Shown in the Home screen greeting"
            last
          >
            <div style={s.inputGroup}>
              <input
                ref={nameRef}
                style={s.textInput}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
                placeholder="Your name"
                maxLength={24}
              />
              <button style={s.saveBtn} onClick={handleSaveName}>
                {savedName
                  ? <IoCheckmarkCircle size={16} color="#4ade80" />
                  : "Save"
                }
              </button>
            </div>
          </SettingRow>
        </div>


        {/* ─────────────────────────────────────
            SECTION 2 — VOICE & SOUND
            ───────────────────────────────────── */}
        <div className="glass" style={s.card}>
          <SectionHeader title="🎤  VOICE & SOUND" />

          <SettingRow
            icon={<IoMicOutline size={16} />}
            label="Voice Input"
            sublabel="Use microphone to speak messages"
          >
            <Toggle value={voiceEnabled} onChange={setVoiceEnabled} />
          </SettingRow>

          <SettingRow
            icon={<IoNotificationsOutline size={16} />}
            label="Sound Effects"
            sublabel="Play sounds on send / receive"
            last
          >
            <Toggle value={soundEnabled} onChange={handleSoundToggle} />
          </SettingRow>
        </div>


        {/* ─────────────────────────────────────
            SECTION 3 — DISPLAY
            ───────────────────────────────────── */}
        <div className="glass" style={s.card}>
          <SectionHeader title="🎨  DISPLAY" />

          <SettingRow
            icon={<IoColorPaletteOutline size={16} />}
            label="Chat Font Size"
            sublabel="Size of text inside chat bubbles"
          >
            <div style={s.fontSizePicker}>
              {["small", "medium", "large"].map(size => (
                <button
                  key={size}
                  style={{
                    ...s.fontSizeBtn,
                    background: fontSize === size
                      ? "linear-gradient(135deg,#a78bfa,#7c3aed)"
                      : "rgba(139,100,220,0.10)",
                    color: fontSize === size
                      ? "#fff"
                      : "var(--color-text-secondary)",
                    border: `1px solid ${
                      fontSize === size
                        ? "transparent"
                        : "rgba(139,100,220,0.20)"
                    }`,
                  }}
                  onClick={() => handleFontSize(size)}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            icon={<IoChatbubblesOutline size={16} />}
            label="Auto-scroll"
            sublabel="Scroll to latest message automatically"
            last
          >
            <Toggle value={autoScroll} onChange={handleAutoScrollToggle} />
          </SettingRow>
        </div>


        {/* ─────────────────────────────────────
            SECTION 4 — SERVER / NETWORK
            ───────────────────────────────────── */}
        <div className="glass" style={s.card}>
          <SectionHeader title="🖥️  SERVER" />

          {/* Connection status */}
          <div style={{
            ...s.statusBar,
            background: isOnline
              ? "rgba(74,222,128,0.10)"
              : "rgba(248,113,113,0.10)",
            borderColor: isOnline
              ? "rgba(74,222,128,0.28)"
              : "rgba(248,113,113,0.28)",
          }}>
            <div style={{
              ...s.statusDot,
              background: isOnline ? "#4ade80" : "#f87171",
              boxShadow: isOnline
                ? "0 0 8px rgba(74,222,128,0.8)"
                : "0 0 8px rgba(248,113,113,0.8)",
            }} />
            <span style={{
              color: isOnline ? "#4ade80" : "#f87171",
              fontWeight: 600,
              fontSize: "0.82rem",
              fontFamily: "var(--font-body)",
            }}>
              Flask backend is {isOnline ? "reachable ✓" : "offline ✗"}
            </span>
          </div>

          <SettingRow
            icon={<IoServerOutline size={16} />}
            label="Flask Server IP"
            sublabel={`Default: ${FLASK_IP}:${FLASK_PORT}  (your Termux IP)`}
          >
            <div style={s.inputGroup}>
              <input
                style={{ ...s.textInput, width: 128, fontSize: "0.78rem" }}
                value={ipInput}
                onChange={e => setIpInput(e.target.value)}
                placeholder={`${FLASK_IP}:${FLASK_PORT}`}
              />
              <button style={s.saveBtn} onClick={handleSaveIP}>
                {savedIP
                  ? <IoCheckmarkCircle size={16} color="#4ade80" />
                  : "Save"
                }
              </button>
            </div>
          </SettingRow>

          {/* Ping row */}
          <div style={s.pingRow}>
            <button
              style={{ ...s.outlineBtn, opacity: pinging ? 0.55 : 1 }}
              onClick={handlePing}
              disabled={pinging}
            >
              {pinging
                ? <><MiniLoader size={14} color="#8b5cf6" /> Pinging…</>
                : <><IoRefreshOutline size={14} /> Test Connection</>
              }
            </button>

            {pingStatus === "ok" && (
              <div style={{ ...s.pingResult, color: "#4ade80" }}>
                <IoCheckmarkCircle size={15} /> Connected!
              </div>
            )}
            {pingStatus === "fail" && (
              <div style={{ ...s.pingResult, color: "#f87171" }}>
                <IoAlertCircle size={15} /> Unreachable — check IP & Flask
              </div>
            )}
          </div>

          {/* Termux tip */}
          <div style={s.tip}>
            <IoInformationCircle size={14} color="#a78bfa" />
            <span>
              In Termux run{" "}
              <code style={s.code}>ip addr | grep "inet 192"</code>
              {" "}to find your IP, then{" "}
              <code style={s.code}>python app.py</code>
            </span>
          </div>
        </div>


        {/* ─────────────────────────────────────
            SECTION 5 — DATA & PRIVACY
            ───────────────────────────────────── */}
        <div className="glass" style={s.card}>
          <SectionHeader title="🗑️  DATA & PRIVACY" />

          <SettingRow
            icon={<IoTrashOutline size={16} />}
            label={confirmClear ? "Tap again to confirm" : "Clear Chat History"}
            sublabel="Removes all messages from this device"
            danger
          >
            <button
              style={{
                ...s.dangerBtn,
                background: confirmClear
                  ? "rgba(248,113,113,0.22)"
                  : "rgba(248,113,113,0.08)",
              }}
              onClick={handleClearHistory}
            >
              {confirmClear ? "Confirm" : "Clear"}
            </button>
          </SettingRow>

          <SettingRow
            icon={<IoShieldOutline size={16} />}
            label={confirmReset ? "Tap again — this is irreversible" : "Factory Reset"}
            sublabel="Clears all data and reloads the app"
            danger
            last
          >
            <button
              style={{
                ...s.dangerBtn,
                background: confirmReset
                  ? "rgba(248,113,113,0.22)"
                  : "rgba(248,113,113,0.08)",
              }}
              onClick={handleFactoryReset}
            >
              {confirmReset ? "Reset" : "Reset"}
            </button>
          </SettingRow>
        </div>


        {/* ─────────────────────────────────────
            SECTION 6 — ABOUT
            ───────────────────────────────────── */}
        <div className="glass" style={s.card}>
          <SectionHeader title="ℹ️  ABOUT" />

          <div style={s.aboutRow}>
            <div style={s.aboutOrb}>M</div>
            <div style={s.aboutInfo}>
              <div style={s.aboutName}>{APP.NAME}</div>
              <div style={s.aboutTag}>{APP.TAGLINE}</div>
              <div style={s.aboutMeta}>
                v{APP.VERSION} · React + Flask · Built for Termux/Android
              </div>
            </div>
          </div>

          <button
            style={s.aboutLink}
            onClick={() => navigate(ROUTES.ABOUT)}
          >
            <IoInformationCircle size={15} color="#8b5cf6" />
            View full About page
          </button>
        </div>


        {/* Bottom spacer */}
        <div style={{ height: 32 }} />

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
    overflow:      "hidden",
  },

  body: {
    flex:    1,
    padding: "var(--space-md)",
    display: "flex",
    flexDirection: "column",
    gap:     "var(--space-md)",
  },

  /* Glass card wrapping each section */
  card: {
    padding:       "var(--space-md)",
    display:       "flex",
    flexDirection: "column",
    animation:     "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
  },

  sectionTitle: {
    fontFamily:    "var(--font-body)",
    fontSize:      "0.68rem",
    fontWeight:    700,
    color:         "var(--color-text-muted)",
    letterSpacing: "0.10em",
    marginBottom:  "var(--space-sm)",
  },

  /* Setting row */
  row: {
    display:      "flex",
    alignItems:   "center",
    gap:          12,
    paddingTop:   10,
    paddingBottom:10,
  },

  rowIcon: {
    width:           34,
    height:          34,
    borderRadius:    "50%",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },

  rowLabels: {
    flex:          1,
    display:       "flex",
    flexDirection: "column",
    gap:           2,
    minWidth:      0,
  },

  rowLabel: {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize:   "0.88rem",
  },

  rowSublabel: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.68rem",
    color:      "var(--color-text-muted)",
    lineHeight: 1.4,
  },

  rowControl: {
    flexShrink: 0,
  },

  /* Toggle */
  toggle: {
    width:         46,
    height:        26,
    borderRadius:  "var(--radius-full)",
    border:        "none",
    display:       "flex",
    alignItems:    "center",
    padding:       3,
    cursor:        "pointer",
    transition:    "background 0.25s ease, justify-content 0.01s",
  },

  toggleThumb: {
    width:        20,
    height:       20,
    borderRadius: "50%",
    background:   "#fff",
    boxShadow:    "0 1px 6px rgba(0,0,0,0.18)",
  },

  /* Input + save button group */
  inputGroup: {
    display:     "flex",
    alignItems:  "center",
    gap:         6,
  },

  textInput: {
    background:   "rgba(139,100,220,0.08)",
    border:       "1px solid rgba(139,100,220,0.22)",
    borderRadius: "var(--radius-sm)",
    padding:      "6px 10px",
    fontSize:     "0.85rem",
    color:        "var(--color-text-primary)",
    fontFamily:   "var(--font-body)",
    width:        108,
    outline:      "none",
  },

  saveBtn: {
    background:   "rgba(139,100,220,0.12)",
    border:       "1px solid rgba(139,100,220,0.25)",
    borderRadius: "var(--radius-sm)",
    padding:      "6px 12px",
    fontSize:     "0.78rem",
    fontWeight:   600,
    color:        "#8b5cf6",
    cursor:       "pointer",
    fontFamily:   "var(--font-body)",
    display:      "flex",
    alignItems:   "center",
    gap:          4,
    transition:   "background var(--transition-fast)",
  },

  savedBadge: {
    display:     "flex",
    alignItems:  "center",
    gap:         4,
    color:       "#4ade80",
    fontSize:    "0.75rem",
    fontWeight:  600,
    fontFamily:  "var(--font-body)",
    animation:   "fadeIn 0.2s ease both",
  },

  /* Font size picker */
  fontSizePicker: {
    display: "flex",
    gap:     4,
  },

  fontSizeBtn: {
    padding:      "4px 9px",
    borderRadius: "var(--radius-sm)",
    fontSize:     "0.72rem",
    fontWeight:   600,
    cursor:       "pointer",
    fontFamily:   "var(--font-body)",
    transition:   "background 0.2s ease, color 0.2s ease",
  },

  /* Server status bar */
  statusBar: {
    display:      "flex",
    alignItems:   "center",
    gap:          8,
    padding:      "8px 12px",
    borderRadius: "var(--radius-sm)",
    border:       "1px solid",
    marginBottom: "var(--space-sm)",
  },

  statusDot: {
    width:        8,
    height:       8,
    borderRadius: "50%",
    flexShrink:   0,
    animation:    "loaderFade 2s ease-in-out infinite",
  },

  /* Ping row */
  pingRow: {
    display:     "flex",
    alignItems:  "center",
    gap:         10,
    marginTop:   "var(--space-sm)",
    flexWrap:    "wrap",
  },

  outlineBtn: {
    display:      "flex",
    alignItems:   "center",
    gap:          6,
    background:   "rgba(139,100,220,0.08)",
    border:       "1px solid rgba(139,100,220,0.22)",
    borderRadius: "var(--radius-sm)",
    padding:      "7px 14px",
    fontSize:     "0.80rem",
    fontWeight:   500,
    color:        "#8b5cf6",
    cursor:       "pointer",
    fontFamily:   "var(--font-body)",
    transition:   "opacity 0.2s ease",
  },

  pingResult: {
    display:    "flex",
    alignItems: "center",
    gap:        5,
    fontSize:   "0.78rem",
    fontWeight: 600,
    fontFamily: "var(--font-body)",
  },

  /* Termux tip box */
  tip: {
    display:      "flex",
    alignItems:   "flex-start",
    gap:          7,
    marginTop:    "var(--space-sm)",
    background:   "rgba(167,139,250,0.08)",
    border:       "1px solid rgba(167,139,250,0.20)",
    borderRadius: "var(--radius-sm)",
    padding:      "8px 10px",
    fontSize:     "0.72rem",
    color:        "var(--color-text-secondary)",
    fontFamily:   "var(--font-body)",
    lineHeight:   1.55,
  },

  code: {
    background:   "rgba(139,100,220,0.12)",
    borderRadius: 4,
    padding:      "1px 5px",
    fontFamily:   "monospace",
    fontSize:     "0.70rem",
    color:        "#8b5cf6",
  },

  /* Danger button */
  dangerBtn: {
    border:       "1px solid rgba(248,113,113,0.28)",
    borderRadius: "var(--radius-sm)",
    padding:      "5px 14px",
    fontSize:     "0.78rem",
    fontWeight:   600,
    color:        "#f87171",
    cursor:       "pointer",
    fontFamily:   "var(--font-body)",
    transition:   "background 0.2s ease",
  },

  /* About row */
  aboutRow: {
    display:     "flex",
    alignItems:  "center",
    gap:         14,
    padding:     "var(--space-sm) 0",
  },

  aboutOrb: {
    width:           52,
    height:          52,
    borderRadius:    "50%",
    background:      "radial-gradient(circle at 35% 35%, #b97fe8, #7c3aed 60%, #4c1d95)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontFamily:      "var(--font-display)",
    fontWeight:      800,
    fontSize:        "1.3rem",
    color:           "#fff",
    boxShadow:       "0 0 18px rgba(124,58,237,0.40)",
    flexShrink:      0,
    animation:       "orbFloat 4s ease-in-out infinite",
  },

  aboutInfo: {
    display:       "flex",
    flexDirection: "column",
    gap:           3,
  },

  aboutName: {
    fontFamily:  "var(--font-display)",
    fontWeight:  800,
    fontSize:    "1rem",
    color:       "var(--color-text-primary)",
  },

  aboutTag: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.76rem",
    color:      "var(--color-text-secondary)",
  },

  aboutMeta: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.68rem",
    color:      "var(--color-text-muted)",
  },

  aboutLink: {
    display:      "flex",
    alignItems:   "center",
    gap:          6,
    background:   "none",
    border:       "none",
    padding:      "6px 0 0",
    fontSize:     "0.80rem",
    fontWeight:   500,
    color:        "#8b5cf6",
    cursor:       "pointer",
    fontFamily:   "var(--font-body)",
    textDecoration:"underline",
    textUnderlineOffset: 3,
  },
};
