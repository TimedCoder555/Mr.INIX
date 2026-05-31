import React, { useState } from "react";

function ChatBox() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("User:", message);

    setMessage("");
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox">

        <input
          type="text"
          placeholder="Ask Mr.INIX anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button onClick={handleSend}>
          Send
        </button>

      </div>
    </div>
  );
}

export default ChatBox;