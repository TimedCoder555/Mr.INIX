import React, { useState } from "react";

function VoiceButton() {
  const [listening, setListening] = useState(false);

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice Input:", transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <button
      className={`voice-btn ${listening ? "active" : ""}`}
      onClick={startVoice}
    >
      🎤 {listening ? "Listening..." : "Speak"}
    </button>
  );
}

export default VoiceButton;