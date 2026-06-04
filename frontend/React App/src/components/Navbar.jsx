/* ============================================================
   Navbar.jsx  —  Mr.INIX Top Navigation Bar
   Matches the screenshot: hamburger menu (☰) on left,
   settings gear (⚙) on right, transparent glass style.
   ============================================================ */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RxHamburgerMenu }  from "react-icons/rx";
import { IoSettingsOutline } from "react-icons/io5";
import { IoArrowBack }       from "react-icons/io5";
import { IoInformationCircleOutline } from "react-icons/io5";

import { useApp }   from "../App";
import { ROUTES }   from "../utils/constants";

/* ══════════════════════════════════════════════════════════
   SLIDE-OUT DRAWER MENU
   ══════════════════════════════════════════════════════════ */

function DrawerMenu({ isOpen, onClose }) {
  const navigate   = useNavigate();
  const { isOnline, clearHistory } = useApp();

  const menuItems = [
    { label: "Home",     icon: "🏠", route: ROUTES.HOME     },
    { label: "Chat",     icon: "💬", route: ROUTES.CHAT     },
    { label: "About",    icon: "ℹ️",  route: ROUTES.ABOUT   },
    { label: "Settings", icon: "⚙️", route: ROUTES.SETTINGS },
  ];

  function handleNav(route) {
    navigate(route);
    onClose();
  }

  function handleClearHistory() {
    clearHistory();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={s.backdrop}
      />

      {/* Drawer panel */}
      <div style={s.drawer}>

        {/* Drawer header */}
        <div style={s.drawerHeader}>
          <div style={s.drawerLogo}>
            <div style={s.drawerOrb}>M</div>
            <div>
              <div style={s.drawerTitle}>Mr.INIX</div>
              <div style={s.drawerSub}>Futuristic AI Assistant</div>
            </div>
          </div>

          {/* Online / offline badge */}
          <div style={{
            ...s.onlineBadge,
            background: isOnline
              ? "rgba(74, 222, 128, 0.15)"
              : "rgba(248, 113, 113, 0.15)",
            color: isOnline ? "#4ade80" : "#f87171",
          }}>
            <span style={{
              ...s.onlineDot,
              background: isOnline ? "#4ade80" : "#f87171",
              boxShadow: isOnline
                ? "0 0 6px rgba(74,222,128,0.8)"
                : "0 0 6px rgba(248,113,113,0.8)",
            }} />
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Divider */}
        <div style={s.drawerDivider} />

        {/* Nav items */}
        <nav style={s.drawerNav}>
          {menuItems.map(item => (
            <button
              key={item.route}
              style={s.drawerItem}
              onClick={() => handleNav(item.route)}
            >
              <span style={s.drawerItemIcon}>{item.icon}</span>
              <span style={s.drawerItemLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div style={s.drawerDivider} />

        {/* Clear history */}
        <button
          style={{ ...s.drawerItem, ...s.drawerDanger }}
          onClick={handleClearHistory}
        >
          <span style={s.drawerItemIcon}>🗑️</span>
          <span style={s.drawerItemLabel}>Clear Chat History</span>
        </button>

        {/* Version */}
        <div style={s.drawerVersion}>Mr.INIX v1.0.0</div>
      </div>
    </>
  );
}


/* ══════════════════════════════════════════════════════════
   MAIN NAVBAR COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  /* Show back arrow on all pages except Home */
  const isHome    = location.pathname === ROUTES.HOME;

  function handleLeftBtn() {
    if (isHome) {
      setDrawerOpen(true);
    } else {
      navigate(-1);          // go back
    }
  }

  function handleSettings() {
    navigate(ROUTES.SETTINGS);
  }

  return (
    <>
      <nav className="glass-navbar" style={s.navbar}>

        {/* Left — hamburger on Home, back arrow elsewhere */}
        <button
          className="glass-icon-btn"
          onClick={handleLeftBtn}
          aria-label={isHome ? "Open menu" : "Go back"}
          style={s.iconBtn}
        >
          {isHome
            ? <RxHamburgerMenu size={18} />
            : <IoArrowBack     size={18} />
          }
        </button>

        {/* Centre — page title (hidden on Home, shows on sub-pages) */}
        {!isHome && (
          <div style={s.pageTitle}>
            {location.pathname === ROUTES.CHAT     && "Chat"}
            {location.pathname === ROUTES.ABOUT    && "About"}
            {location.pathname === ROUTES.SETTINGS && "Settings"}
          </div>
        )}

        {/* Right — settings gear */}
        <button
          className="glass-icon-btn"
          onClick={handleSettings}
          aria-label="Settings"
          style={s.iconBtn}
        >
          <IoSettingsOutline size={18} />
        </button>

      </nav>

      {/* Slide-out drawer */}
      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {
  /* ── Navbar bar ── */
  navbar: {
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "space-between",
    padding:         "10px 16px",
    position:        "relative",
    zIndex:          50,
    flexShrink:      0,
    animation:       "slideDown 0.4s cubic-bezier(0.22,1,0.36,1) both",
  },

  iconBtn: {
    flexShrink: 0,
  },

  pageTitle: {
    position:    "absolute",
    left:        "50%",
    transform:   "translateX(-50%)",
    fontFamily:  "var(--font-display)",
    fontWeight:  700,
    fontSize:    "1rem",
    color:       "var(--color-text-primary)",
    pointerEvents: "none",
  },

  /* ── Backdrop ── */
  backdrop: {
    position:   "fixed",
    inset:      0,
    background: "rgba(80, 50, 140, 0.20)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex:     90,
    animation:  "fadeIn 0.25s ease both",
  },

  /* ── Drawer panel ── */
  drawer: {
    position:   "fixed",
    top:        0,
    left:       0,
    bottom:     0,
    width:      "72vw",
    maxWidth:   280,
    zIndex:     100,
    display:    "flex",
    flexDirection: "column",
    padding:    "48px 0 32px",
    background: "rgba(245, 240, 255, 0.92)",
    backdropFilter: "blur(32px) saturate(200%)",
    WebkitBackdropFilter: "blur(32px) saturate(200%)",
    borderRight: "1px solid rgba(255,255,255,0.80)",
    boxShadow:  "4px 0 40px rgba(100,60,200,0.18)",
    animation:  "slideDown 0.35s cubic-bezier(0.22,1,0.36,1) both",
  },

  /* ── Drawer header ── */
  drawerHeader: {
    padding:    "0 20px 16px",
    display:    "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap:        12,
  },

  drawerLogo: {
    display:    "flex",
    alignItems: "center",
    gap:        10,
  },

  drawerOrb: {
    width:           40,
    height:          40,
    borderRadius:    "50%",
    background:      "linear-gradient(135deg,#a78bfa,#7c3aed)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontFamily:      "var(--font-display)",
    fontWeight:      800,
    fontSize:        "1.1rem",
    color:           "#fff",
    boxShadow:       "0 0 16px rgba(124,58,237,0.45)",
    flexShrink:      0,
  },

  drawerTitle: {
    fontFamily:  "var(--font-display)",
    fontWeight:  800,
    fontSize:    "1rem",
    color:       "var(--color-text-primary)",
    lineHeight:  1.2,
  },

  drawerSub: {
    fontSize:   "0.68rem",
    color:      "var(--color-text-muted)",
    marginTop:  1,
  },

  onlineBadge: {
    display:      "flex",
    alignItems:   "center",
    gap:          5,
    padding:      "3px 8px",
    borderRadius: "var(--radius-full)",
    fontSize:     "0.70rem",
    fontWeight:   600,
    flexShrink:   0,
  },

  onlineDot: {
    width:         6,
    height:        6,
    borderRadius:  "50%",
    display:       "inline-block",
    flexShrink:    0,
  },

  drawerDivider: {
    height:     1,
    background: "rgba(139,100,220,0.12)",
    margin:     "8px 20px",
  },

  /* ── Drawer nav items ── */
  drawerNav: {
    display:       "flex",
    flexDirection: "column",
    padding:       "8px 0",
  },

  drawerItem: {
    display:     "flex",
    alignItems:  "center",
    gap:         14,
    padding:     "13px 24px",
    background:  "none",
    border:      "none",
    cursor:      "pointer",
    textAlign:   "left",
    width:       "100%",
    transition:  "background var(--transition-fast)",
    borderRadius: 0,
  },

  drawerItemIcon: {
    fontSize:   "1.1rem",
    flexShrink: 0,
    width:      22,
    textAlign:  "center",
  },

  drawerItemLabel: {
    fontFamily:  "var(--font-body)",
    fontWeight:  500,
    fontSize:    "0.92rem",
    color:       "var(--color-text-primary)",
  },

  drawerDanger: {
    margin: "4px 0",
  },

  drawerVersion: {
    marginTop:  "auto",
    padding:    "0 24px",
    fontSize:   "0.68rem",
    color:      "var(--color-text-muted)",
    fontWeight: 400,
  },
};
