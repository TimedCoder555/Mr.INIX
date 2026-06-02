import React, { useState } from "react";
import { sendMessage } from "../utils/api";

function ChatBox() {

  const [message, setMessage] = useState("");

  const [reply, setReply] = useState("");

  const handleSend = async () => {

    if (!message) return;

    const aiReply = await sendMessage(message);

    setReply(aiReply);
  };

  return (
    <div>

      <input
        type="text"
        placeholder="Ask Mr.INIX..."
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <button onClick={handleSend}>
        Send
      </button>

      <p>
        <strong>Mr.INIX:</strong> {reply}
      </p>

    </div>
  );
}

export default ChatBox;