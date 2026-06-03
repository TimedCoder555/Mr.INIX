import React, { useState } from "react";
import { sendMessage } from "../utils/api";

function ChatBox() {

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {

    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {

      const aiReply = await sendMessage(message);

      setReply(aiReply);

    } catch (error) {

      setReply("Error: AI not responding 😢");

    } finally {

      setLoading(false);
      setMessage("");
    }
  };

  // Enter key support
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <input
        type="text"
        placeholder="Ask Mr.INIX..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        style={{
          padding: "10px",
          width: "250px",
          marginRight: "10px"
        }}
      />

      <button
        onClick={handleSend}
        style={{
          padding: "10px 15px",
          cursor: "pointer"
        }}
      >
        Send
      </button>

      <div style={{ marginTop: "20px" }}>

        {loading && (
          <p>🤖 Mr.INIX is thinking...</p>
        )}

        {reply && (
          <p>
            <strong>Mr.INIX:</strong> {reply}
          </p>
        )}

      </div>

    </div>
  );
}

export default ChatBox;