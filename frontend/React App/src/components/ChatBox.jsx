/* ============================================================
   ChatBox.jsx  —  Mr.INIX Core Chat Engine
   Handles message rendering, input, sending, auto-scroll,
   typing indicator, and error states.
   ============================================================ */

import React, {
  useState, useEffect, useRef, useCallback
} from "react";

import { useApp }          from "../App";
import { sendChat }        from "../utils/api";
import {
  createMessage,
  formatTime,
  groupMessagesByDate,
  isNearBottom,
  scrollToBottom,
  isBlank,
  loadFromStorage,
}                          from "../utils/helpers";
import { CHAT, ERRORS, STORAGE } from "../utils/constants";
import { MiniLoader }      from "./Loader";
import VoiceButton         from "./VoiceButton";
import { ORB_STATE }       from "./FloatingOrb";

/* ── Icons ── */
import { IoSend }          from "react-icons/io5";
import { IoAdd }           from "react-icons/io5";
import { IoChevronDown }   from "react-icons/io5";


/* ══════════════════════════════════════════════════════════
   DATE SEPARATOR ROW
   ══════════════════════════════════════════════════════════ */

function DateSeparator({ label }) {
  return (
    <div className="chat-date-sep">
      {label}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   SINGLE MESSAGE BUBBLE
   ══════════════════════════════════════════════════════════ */

function MessageBubble({ message }) {
  const isUser = message.role === CHAT.ROLES.USER;

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>

      {/* Avatar */}
      <div className={`msg-avatar ${isUser ? "user" : "ai"}`}>
        {isUser ? "U" : "M"}
      </div>

      {/* Bubble + timestamp */}
      <div className="msg-col">
        <div className={isUser ? "bubble-user" : "bubble-ai"}>
          {message.text}
        </div>
        <div className="msg-time">
          {formatTime(new Date(message.timestamp))}
        </div>
      </div>

    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   TYPING INDICATOR
   ══════════════════════════════════════════════════════════ */

function TypingIndicator() {
  return (
    <div className="msg-row ai">
      <div className="msg-avatar ai">M</div>
      <div className="msg-col">
        <div className="bubble-typing">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════ */

function EmptyState() {
  return (
    <div className="chat-empty">
      <div className="chat-empty-icon">💬</div>
      <h3>Start a conversation</h3>
      <p>Ask Mr.INIX anything — type below or tap the mic</p>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   MAIN CHATBOX COMPONENT
   ══════════════════════════════════════════════════════════ */

const BUBBLE_FONT = { small: "0.82rem", medium: "0.92rem", large: "1.05rem" };

export default function ChatBox({ onOrbStateChange }) {
  const { messages, setMessages, setIsOnline, voiceEnabled } = useApp();

  const [input,       setInput]       = useState("");
  const [isTyping,    setIsTyping]    = useState(false);  // AI thinking
  const [showScroll,  setShowScroll]  = useState(false);  // scroll-to-bottom btn
  const [charCount,   setCharCount]   = useState(0);

  const feedRef    = useRef(null);
  const inputRef   = useRef(null);
  const seededRef  = useRef(false);   // guards the one-time "send pending message"

  /* Display preferences from the Settings page (cheap localStorage reads) */
  const autoScroll = loadFromStorage(STORAGE.AUTO_SCROLL, true) !== false;
  const bubbleFont = BUBBLE_FONT[loadFromStorage(STORAGE.FONT_SIZE, "medium")] || BUBBLE_FONT.medium;


  /* ── Open the chat at the newest message ─────────────── */
  useEffect(() => {
    // Wait one frame so the messages have their final height before scrolling
    const frame = requestAnimationFrame(() => {
      if (autoScroll) scrollToBottom(feedRef.current, false);
    });
    return () => cancelAnimationFrame(frame);
    // Only when the chat opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auto-scroll when messages change (Settings > Auto-scroll) ── */
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed || !autoScroll) return;
    if (isNearBottom(feed, CHAT.SCROLL_THRESHOLD_PX)) {
      scrollToBottom(feed);
    }
  }, [messages, isTyping, autoScroll]);


  /* ── Show/hide scroll-to-bottom button ────────────────── */
  function handleFeedScroll() {
    const feed = feedRef.current;
    if (!feed) return;
    setShowScroll(!isNearBottom(feed, CHAT.SCROLL_THRESHOLD_PX));
  }


  /* ── Append a message to state ─────────────────────────── */
  const appendMessage = useCallback((role, text) => {
    setMessages(prev => [...prev, createMessage(role, text)]);
  }, [setMessages]);


  /* ── Core send function ────────────────────────────────── */
  const sendToBackend = useCallback(async (text, currentMessages) => {
    onOrbStateChange?.(ORB_STATE.THINKING);
    setIsTyping(true);

    try {
      const reply = await sendChat(text, currentMessages);
      setIsOnline(true);
      appendMessage("assistant", reply);
    } catch (err) {
      if (err.status === 0) setIsOnline(false);   // network failure / timeout
      appendMessage("assistant", err.message || ERRORS.UNKNOWN);
    } finally {
      onOrbStateChange?.(ORB_STATE.IDLE);
      setIsTyping(false);
    }
  }, [appendMessage, onOrbStateChange, setIsOnline]);


  /* ── Send the message waiting from Home / a suggestion card ── */
  useEffect(() => {
    if (seededRef.current) return;            // React StrictMode runs effects twice in dev
    const last = messages[messages.length - 1];
    if (last?.role === CHAT.ROLES.USER && last?._pending) {
      seededRef.current = true;
      setMessages(prev =>
        prev.map((m, i) => (i === prev.length - 1 ? { ...m, _pending: false } : m))
      );
      sendToBackend(last.text, messages);
    }
    // Run once when the chat opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* ── Handle send button / Enter key ───────────────────── */
  async function handleSend() {
    const text = input.trim();
    if (isBlank(text) || isTyping) return;
    if (text.length > CHAT.MAX_INPUT_LENGTH) return;

    const userMsg = createMessage("user", text);
    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput("");
    setCharCount(0);
    inputRef.current?.focus({ preventScroll: true });

    await sendToBackend(text, updated);
  }


  /* ── Input change ──────────────────────────────────────── */
  function handleInputChange(e) {
    const val = e.target.value;
    if (val.length > CHAT.MAX_INPUT_LENGTH) return;
    setInput(val);
    setCharCount(val.length);
  }


  /* ── Enter to send, Shift+Enter = new line ─────────────── */
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }


  /* ── Voice transcript received ─────────────────────────── */
  function handleVoiceTranscript(transcript) {
    setInput(transcript);
    setCharCount(transcript.length);
    inputRef.current?.focus({ preventScroll: true });
  }


  /* ── Voice state → orb state ───────────────────────────── */
  function handleVoiceStateChange(isListening) {
    onOrbStateChange?.(
      isListening ? ORB_STATE.LISTENING : ORB_STATE.IDLE
    );
  }


  /* ── Group messages by date for separators ─────────────── */
  const grouped = groupMessagesByDate(messages);
  const hasMessages = messages.length > 0;
  const nearMax = charCount > CHAT.MAX_INPUT_LENGTH * 0.85;


  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="chat-page">

      {/* ── Message feed ── */}
      <div className="chat-feed-wrapper">
        <div
          className="chat-feed scroll-y"
          ref={feedRef}
          onScroll={handleFeedScroll}
          style={{ "--bubble-font": bubbleFont }}
        >
          {!hasMessages && <EmptyState />}

          {grouped.map((group, gi) => (
            <React.Fragment key={gi}>

              {/* Date separator */}
              <DateSeparator label={group.dateLabel} />

              {/* Messages in this date group */}
              {group.messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

            </React.Fragment>
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

        </div>

        {/* Scroll-to-bottom button */}
        {showScroll && (
          <button
            className="chat-scroll-btn"
            onClick={() => scrollToBottom(feedRef.current)}
            aria-label="Scroll to bottom"
          >
            <IoChevronDown size={16} />
          </button>
        )}
      </div>


      {/* ── Input bar ── */}
      <div className="chat-input-area">

        {/* Char counter — only shows near limit */}
        {nearMax && (
          <div style={s.charCounter}>
            <span style={{ color: charCount >= CHAT.MAX_INPUT_LENGTH ? "#f87171" : "var(--color-text-muted)" }}>
              {charCount}/{CHAT.MAX_INPUT_LENGTH}
            </span>
          </div>
        )}

        <div className="glass-input-bar chat-input-row">

          {/* Attach / extra options button */}
          <button
            className="chat-attach-btn"
            aria-label="Attach"
            onClick={() => {/* future: file upload */}}
          >
            <IoAdd size={18} />
          </button>

          {/* Text input */}
          <textarea
            ref={inputRef}
            className="chat-text-input"
            placeholder={CHAT.PLACEHOLDER}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            rows={1}
            aria-label="Message input"
          />

          {/* Voice button */}
          {voiceEnabled && (
            <VoiceButton
              onTranscript={handleVoiceTranscript}
              onStateChange={handleVoiceStateChange}
              disabled={isTyping}
            />
          )}

          {/* Send button — shows when input has text */}
          {input.trim().length > 0 && (
            <button
              style={{
                ...s.sendBtn,
                opacity: isTyping ? 0.45 : 1,
                cursor:  isTyping ? "not-allowed" : "pointer",
              }}
              onClick={handleSend}
              disabled={isTyping}
              aria-label="Send message"
            >
              {isTyping
                ? <MiniLoader size={18} color="#fff" />
                : <IoSend size={17} />
              }
            </button>
          )}

        </div>
      </div>

    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {
  sendBtn: {
    width:           42,
    height:          42,
    borderRadius:    "50%",
    border:          "none",
    background:      "linear-gradient(135deg,#a78bfa,#7c3aed)",
    color:           "#fff",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
    boxShadow:       "0 4px 16px rgba(124,58,237,0.40)",
    transition:      "opacity 0.2s ease, transform 0.15s ease",
    animation:       "scaleIn 0.2s ease both",
  },

  charCounter: {
    textAlign:   "right",
    padding:     "0 16px 4px",
    fontSize:    "0.70rem",
    fontFamily:  "var(--font-body)",
    transition:  "color 0.2s ease",
  },
};
