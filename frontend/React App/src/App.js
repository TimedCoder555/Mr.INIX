import React from "react";
import "./App.css";

function App() {
  return (
    <div className="app">

      {/* Background Glow */}
      <div className="bg-glow"></div>

      {/* Header */}
      <header className="header">
        <h1>Mr.INIX</h1>
        <p>Your Futuristic AI Assistant</p>
      </header>

      {/* AI Orb */}
      <div className="orb-container">
        <div className="orb"></div>
      </div>

      {/* Status */}
      <div className="status">
        <span className="online-dot"></span>
        Online
      </div>

      {/* Chat Box */}
      <div className="chat-box">
        <input
          type="text"
          placeholder="Ask Mr.INIX anything..."
        />
        <button>Send</button>
      </div>

    </div>
  );
}

export default App;