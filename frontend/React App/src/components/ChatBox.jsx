import { useState, useRef, useEffect } from "react";
import { sendMessage } from "./utils/api";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm Mr.INIX. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // 1. Add user message immediately
    const userMsg = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 2. Call backend
      const reply = await sendMessage(trimmed);

      // 3. Add AI reply
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ Error: ${err.message}. Check that your Flask server is running.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Allow Enter key to send (Shift+Enter = new line)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.dot} />
        <span style={styles.headerTitle}>Mr.INIX</span>
      </div>

      {/* Messages */}
      <div style={styles.messageArea}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background:
                msg.role === "user"
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#1e1e2e",
              color: "#f0f0ff",
              borderRadius:
                msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div
            style={{
              ...styles.bubble,
              alignSelf: "flex-start",
              background: "#1e1e2e",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Mr.INIX is thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={styles.inputRow}>
        <textarea
          style={styles.textarea}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || loading ? 0.45 : 1,
            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
          }}
          onClick={handleSend}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    maxWidth: 680,
    margin: "0 auto",
    background: "#0d0d1a",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 20px",
    borderBottom: "1px solid #2a2a3d",
    background: "#10101f",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#6366f1",
    boxShadow: "0 0 8px #6366f1",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#e0e0ff",
    letterSpacing: 1,
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  bubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    fontSize: 15,
    lineHeight: 1.5,
    wordBreak: "break-word",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  inputRow: {
    display: "flex",
    gap: 10,
    padding: "12px 16px",
    borderTop: "1px solid #2a2a3d",
    background: "#10101f",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "#1a1a2e",
    border: "1px solid #3a3a5c",
    borderRadius: 12,
    color: "#e0e0ff",
    fontSize: 15,
    padding: "10px 14px",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
    flexShrink: 0,
  },
};
