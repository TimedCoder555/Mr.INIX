import React, { useState } from "react";

function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  return (
    <div className="settings-page">

      <h1>⚙️ Settings</h1>

      <div className="settings-card">

        <div className="setting-row">
          <span>🌙 Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>

        <div className="setting-row">
          <span>🎤 Voice Assistant</span>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={() => setVoiceEnabled(!voiceEnabled)}
          />
        </div>

        <div className="setting-row">
          <span>🤖 AI Mode</span>
          <span>Enabled</span>
        </div>

      </div>

    </div>
  );
}

export default Settings;