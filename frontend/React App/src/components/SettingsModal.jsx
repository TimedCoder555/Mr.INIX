/* ============================================================
   SettingsModal.jsx  —  Mr.INIX Settings Bottom Sheet
   Slides up from bottom. Controls:
   - User name
   - Voice on/off
   - Clear chat history
   - Backend IP override
   - App info
   ============================================================ */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate }  from "react-router-dom";
import { useApp }       from "../App";
import { STORAGE, APP, FLASK_IP, FLASK_PORT } from "../utils/constants";
import {
  saveToStorage,
  loadFromStorage,
  clearAllStorage,
  capitalise,
}                       from "../utils/helpers";
import { checkHealth }  from "../utils/api";

/* ── Icons ── */
import { IoClose }               from "react-icons/io5";
import { IoPerson }              from "react-icons/io5";
import { IoMicOutline }          from "react-icons/io5";
import { IoTrashOutline }        from "react-icons/io5";
import { IoServerOutline }       from "react-icons/io5";
import { IoInformationCircle }   from "react-icons/io5";
import { IoCheckmarkCircle }     from "react-icons/io5";
import { IoAlertCircle }         from "react-icons/io5";
import { IoChevronForward }      from "react-icons/io5";


/* ══════════════════════════════════════════════════════════
   REUSABLE SETTING ROW
   ══════════════════════════════════════════════════════════ */

function SettingRow({ icon, label, sublabel, children, danger }) {
  return (
    <div style={{
      ...s.row,
      borderColor: danger
        ? "rgba(248,113,113,0.15)"
        : "rgba(139,100,220,0.10)",
    }}>
      {/* Left icon */}
      <div style={{
        ...s.rowIcon,
        background: danger
          ? "rgba(248,113,113,0.12)"
          : "rgba(139,100,220,0.10)",
        color: danger ? "#f87171" : "#8b5cf6",
      }}>
        {icon}
      </div>

      {/* Label block */}
      <div style={s.rowLabels}>
        <span style={{
          ...s.rowLabel,
          color: danger
            ? "#f87171"
            : "var(--color-text-primary)",
        }}>
          {label}
        </span>
        {sublabel && (
          <span style={s.rowSublabel}>{sublabel}</span>
        )}
      </div>

      {/* Right control */}
      <div style={s.rowControl}>
        {children}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   TOGGLE SWITCH
   ══════════════════════════════════════════════════════════ */

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        ...s.toggle,
        background: value
          ? "linear-gradient(135deg,#a78bfa,#7c3aed)"
          : "rgba(139,100,220,0.18)",
        justifyContent: value ? "flex-end" : "flex-start",
      }}
    >
      <div style={{
        ...s.toggleThumb,
        boxShadow: value
          ? "0 2px 8px rgba(124,58,237,0.40)"
          : "0 1px 4px rgba(0,0,0,0.15)",
      }} />
    </button>
  );
}


/* ══════════════════════════════════════════════════════════
   MAIN SETTINGS MODAL
   ══════════════════════════════════════════════════════════ */

export default function SettingsModal({ isOpen, onClose }) {
  const {
    userName, setUserName,
    voiceEnabled, setVoiceEnabled,
    clearHistory, isOnline,
  } = useApp();

  /* Local state for editable fields */
  const [nameInput,   setNameInput]   = useState(userName);
  const [ipInput,     setIpInput]     = useState(
    loadFromStorage("mrinix_custom_ip", `${FLASK_IP}:${FLASK_PORT}`)
  );
  const [pingStatus,  setPingStatus]  = useState(null); // null | "ok" | "fail"
  const [pinging,     setPinging]     = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [confirmClear,setConfirmClear]= useState(false);
  const nameRef = useRef(null);

  /* Focus name input when modal opens */
  useEffect(() => {
    if (isOpen) {
      setNameInput(userName);
      setPingStatus(null);
      setConfirmClear(false);
      setSaved(false);
      setTimeout(() => nameRef.current?.focus(), 350);
    }
  }, [isOpen]);

  /* Close on backdrop click */
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  /* ── Save user name ── */
  function handleSaveName() {
    const clean = capitalise(nameInput.trim());
    if (!clean) return;
    setUserName(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* ── Save custom IP ── */
  function handleSaveIP() {
    saveToStorage("mrinix_custom_ip", ipInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* ── Ping backend ── */
  async function handlePing() {
    setPinging(true);
    setPingStatus(null);
    const ok = await checkHealth();
    setPingStatus(ok ? "ok" : "fail");
    setPinging(false);
  }

  /* ── Clear history with confirm ── */
  function handleClearHistory() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearHistory();
    setConfirmClear(false);
    onClose();
  }

  /* ── Clear ALL data ── */
  function handleClearAll() {
    clearAllStorage();
    window.location.reload();
  }

  if (!isOpen) return null;

  return (
    <div
      className="glass-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="glass-modal">

        {/* Handle bar */}
        <div className="glass-modal-handle" />

        {/* Header */}
        <div style={s.header}>
          <h2 style={s.title}>Settings</h2>
          <button
            className="glass-icon-btn"
            onClick={onClose}
            aria-label="Close settings"
            style={s.closeBtn}
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* ── Section: Profile ── */}
        <div style={s.section}>
          <p style={s.sectionTitle}>PROFILE</p>

          <SettingRow
            icon={<IoPerson size={16} />}
            label="Your Name"
            sublabel="Shown in greeting on Home screen"
          >
            <div style={s.inputRow}>
              <input
                ref={nameRef}
                style={s.textInput}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
                placeholder="Enter your name"
                maxLength={24}
              />
              <button
                style={s.saveBtn}
                onClick={handleSaveName}
              >
                {saved ? <IoCheckmarkCircle size={18} color="#4ade80" /> : "Save"}
              </button>
            </div>
          </SettingRow>
        </div>

        {/* ── Section: Voice ── */}
        <div style={s.section}>
          <p style={s.sectionTitle}>VOICE</p>

          <SettingRow
            icon={<IoMicOutline size={16} />}
            label="Voice Input"
            sublabel="Tap mic to speak your message"
          >
            <Toggle
              value={voiceEnabled}
              onChange={setVoiceEnabled}
            />
          </SettingRow>
        </div>

        {/* ── Section: Server ── */}
        <div style={s.section}>
          <p style={s.sectionTitle}>SERVER</p>

          {/* Connection status pill */}
          <div style={{
            ...s.statusPill,
            background: isOnline
              ? "rgba(74,222,128,0.12)"
              : "rgba(248,113,113,0.12)",
            borderColor: isOnline
              ? "rgba(74,222,128,0.30)"
              : "rgba(248,113,113,0.30)",
            color: isOnline ? "#4ade80" : "#f87171",
          }}>
            <span style={{
              ...s.statusDot,
              background: isOnline ? "#4ade80" : "#f87171",
              boxShadow: isOnline
                ? "0 0 6px rgba(74,222,128,0.8)"
                : "0 0 6px rgba(248,113,113,0.8)",
            }} />
            Flask backend is {isOnline ? "Online ✓" : "Offline ✗"}
          </div>

          <SettingRow
            icon={<IoServerOutline size={16} />}
            label="Backend IP"
            sublabel="Your Termux Flask server address"
          >
            <div style={s.inputRow}>
              <input
                style={{ ...s.textInput, width: 130, fontSize: "0.78rem" }}
                value={ipInput}
                onChange={e => setIpInput(e.target.value)}
                placeholder="192.0.0.4:5000"
              />
              <button style={s.saveBtn} onClick={handleSaveIP}>
                Save
              </button>
            </div>
          </SettingRow>

          {/* Ping test */}
          <div style={s.pingRow}>
            <button
              style={{
                ...s.pingBtn,
                opacity: pinging ? 0.6 : 1,
              }}
              onClick={handlePing}
              disabled={pinging}
            >
              {pinging ? "Pinging…" : "Test Connection"}
            </button>

            {pingStatus === "ok" && (
              <span style={{ ...s.pingResult, color: "#4ade80" }}>
                <IoCheckmarkCircle size={15} /> Connected!
              </span>
            )}
            {pingStatus === "fail" && (
              <span style={{ ...s.pingResult, color: "#f87171" }}>
                <IoAlertCircle size={15} /> Unreachable
              </span>
            )}
          </div>
        </div>

        {/* ── Section: Data ── */}
        <div style={s.section}>
          <p style={s.sectionTitle}>DATA</p>

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
                  ? "rgba(248,113,113,0.25)"
                  : "rgba(248,113,113,0.10)",
              }}
              onClick={handleClearHistory}
            >
              {confirmClear ? "Confirm" : "Clear"}
            </button>
          </SettingRow>
        </div>

        {/* ── Section: About ── */}
        <div style={{ ...s.section, borderBottom: "none" }}>
          <p style={s.sectionTitle}>ABOUT</p>

          <div style={s.aboutCard}>
            <div style={s.aboutOrb}>M</div>
            <div>
              <div style={s.aboutName}>{APP.NAME}</div>
              <div style={s.aboutTagline}>{APP.TAGLINE}</div>
              <div style={s.aboutVersion}>Version {APP.VERSION}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {
  header: {
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "space-between",
    marginBottom:    "var(--space-md)",
  },

  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize:   "1.2rem",
    color:      "var(--color-text-primary)",
  },

  closeBtn: {
    flexShrink: 0,
  },

  /* Section group */
  section: {
    marginBottom:  "var(--space-md)",
    paddingBottom: "var(--space-md)",
    borderBottom:  "1px solid rgba(139,100,220,0.10)",
  },

  sectionTitle: {
    fontSize:      "0.68rem",
    fontWeight:    600,
    color:         "var(--color-text-muted)",
    letterSpacing: "0.10em",
    marginBottom:  "var(--space-sm)",
    fontFamily:    "var(--font-body)",
  },

  /* Setting row */
  row: {
    display:      "flex",
    alignItems:   "center",
    gap:          12,
    padding:      "10px 0",
    borderBottom: "1px solid",
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
    lineHeight: 1.2,
  },

  rowSublabel: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.70rem",
    color:      "var(--color-text-muted)",
    lineHeight: 1.3,
  },

  rowControl: {
    flexShrink: 0,
    display:    "flex",
    alignItems: "center",
  },

  /* Toggle switch */
  toggle: {
    width:         46,
    height:        26,
    borderRadius:  "var(--radius-full)",
    border:        "none",
    display:       "flex",
    alignItems:    "center",
    padding:       3,
    cursor:        "pointer",
    transition:    "background 0.25s ease, justify-content 0.25s ease",
    flexShrink:    0,
  },

  toggleThumb: {
    width:        20,
    height:       20,
    borderRadius: "50%",
    background:   "#fff",
    transition:   "box-shadow 0.25s ease",
  },

  /* Input + save */
  inputRow: {
    display:     "flex",
    alignItems:  "center",
    gap:         6,
  },

  textInput: {
    background:   "rgba(139,100,220,0.08)",
    border:       "1px solid rgba(139,100,220,0.20)",
    borderRadius: "var(--radius-sm)",
    padding:      "5px 10px",
    fontSize:     "0.85rem",
    color:        "var(--color-text-primary)",
    fontFamily:   "var(--font-body)",
    width:        110,
    outline:      "none",
  },

  saveBtn: {
    background:   "rgba(139,100,220,0.12)",
    border:       "1px solid rgba(139,100,220,0.25)",
    borderRadius: "var(--radius-sm)",
    padding:      "5px 10px",
    fontSize:     "0.78rem",
    fontWeight:   600,
    color:        "#8b5cf6",
    cursor:       "pointer",
    fontFamily:   "var(--font-body)",
    display:      "flex",
    alignItems:   "center",
  },

  /* Danger button */
  dangerBtn: {
    border:       "1px solid rgba(248,113,113,0.30)",
    borderRadius: "var(--radius-sm)",
    padding:      "5px 12px",
    fontSize:     "0.78rem",
    fontWeight:   600,
    color:        "#f87171",
    cursor:       "pointer",
    fontFamily:   "var(--font-body)",
    transition:   "background 0.2s ease",
  },

  /* Status pill */
  statusPill: {
    display:      "inline-flex",
    alignItems:   "center",
    gap:          6,
    padding:      "4px 10px",
    borderRadius: "var(--radius-full)",
    border:       "1px solid",
    fontSize:     "0.75rem",
    fontWeight:   600,
    fontFamily:   "var(--font-body)",
    marginBottom: "var(--space-sm)",
  },

  statusDot: {
    width:        7,
    height:       7,
    borderRadius: "50%",
    flexShrink:   0,
  },

  /* Ping row */
  pingRow: {
    display:     "flex",
    alignItems:  "center",
    gap:         10,
    marginTop:   "var(--space-sm)",
  },

  pingBtn: {
    background:   "rgba(139,100,220,0.10)",
    border:       "1px solid rgba(139,100,220,0.25)",
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
    fontSize:    "0.78rem",
    fontWeight:  600,
    fontFamily:  "var(--font-body)",
    display:     "flex",
    alignItems:  "center",
    gap:         4,
  },

  /* About card */
  aboutCard: {
    display:     "flex",
    alignItems:  "center",
    gap:         14,
    padding:     "var(--space-sm) 0",
  },

  aboutOrb: {
    width:           48,
    height:          48,
    borderRadius:    "50%",
    background:      "linear-gradient(135deg,#a78bfa,#7c3aed)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontFamily:      "var(--font-display)",
    fontWeight:      800,
    fontSize:        "1.2rem",
    color:           "#fff",
    boxShadow:       "0 0 16px rgba(124,58,237,0.40)",
    flexShrink:      0,
  },

  aboutName: {
    fontFamily:  "var(--font-display)",
    fontWeight:  800,
    fontSize:    "1rem",
    color:       "var(--color-text-primary)",
  },

  aboutTagline: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.75rem",
    color:      "var(--color-text-secondary)",
    marginTop:  2,
  },

  aboutVersion: {
    fontFamily: "var(--font-body)",
    fontSize:   "0.68rem",
    color:      "var(--color-text-muted)",
    marginTop:  3,
  },
};
