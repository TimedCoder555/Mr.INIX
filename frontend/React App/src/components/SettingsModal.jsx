import React from "react";

function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="settings-overlay"
      onClick={onClose}
    >
      <div
        className="settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>⚙️ Settings</h2>

          <button
            onClick={onClose}
            className="close-btn"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">

          <div className="setting-item">
            <span>🌙 Dark Mode</span>
            <input type="checkbox" />
          </div>

          <div className="setting-item">
            <span>🔊 Sound Effects</span>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="setting-item">
            <span>🎤 Voice Assistant</span>
            <input type="checkbox" />
          </div>

          <div className="setting-item">
            <span>✨ Animations</span>
            <input type="checkbox" defaultChecked />
          </div>

        </div>

        <div className="settings-footer">
          <p>
            Mr.INIX v1.0
          </p>
        </div>

      </div>
    </div>
  );
}

export default SettingsModal;