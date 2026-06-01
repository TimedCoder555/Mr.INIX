import React from "react";

import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";
import VoiceButton from "../components/VoiceButton";

function Chat() {
  return (
    <div className="chat-page">

      <Navbar />

      <div className="chat-container">

        <div className="chat-header">
          <h1>🤖 Mr.INIX Chat</h1>
          <p>Ask anything and start a conversation.</p>
        </div>

        <div className="chat-messages">

          <div className="ai-message">
            Hello! I am Mr.INIX. How can I help you today?
          </div>

        </div>

        <div className="chat-actions">
          <VoiceButton />
        </div>

        <ChatBox />

      </div>

    </div>
  );
}

export default Chat;