/* ============================================================
   VoiceButton.jsx  —  Mr.INIX Microphone / Voice Input
   Uses Web Speech API (built into Chrome/Android browsers).
   No external library needed — works in Termux browser too.

   Props:
     onTranscript(text)       called when speech is recognised
     onStateChange(bool)      called with true=listening, false=stopped
     disabled                 disables button when AI is replying
   ============================================================ */

import React, {
  useState, useEffect, useRef, useCallback
} from "react";

import { IsMicrophoneAvailable } from "../utils/helpers";
import { VOICE, ERRORS }         from "../utils/constants";

/* ── Icons ── */
import { IoBulbOutline }    from "react-icons/io5";
import { IoMicOutline }     from "react-icons/io5";
import { IoMicOffOutline }  from "react-icons/io5";
import { IoStopCircle }     from "react-icons/io5";


/* ══════════════════════════════════════════════════════════
   SPEECH RECOGNITION HOOK
   Wraps the Web Speech API with start/stop/error handling
   ══════════════════════════════════════════════════════════ */

function useSpeechRecognition({ onTranscript, onStateChange }) {
  const [isListening,  setIsListening]  = useState(false);
  const [isSupported,  setIsSupported]  = useState(false);
  const [errorMsg,     setErrorMsg]     = useState("");
  const recognitionRef = useRef(null);
  const autoStopRef    = useRef(null);

  /* Check browser support once on mount */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    return () => {
      stopListening();
    };
  }, []);

  /* ── Start recording ── */
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg(ERRORS.VOICE_NO_SUPPORT);
      return;
    }

    setErrorMsg("");

    const recognition         = new SpeechRecognition();
    recognition.lang          = VOICE.LANG;
    recognition.continuous    = false;
    recognition.interimResults= true;  // show partial results
    recognition.maxAlternatives = 1;

    /* ── Speech events ── */
    recognition.onstart = () => {
      setIsListening(true);
      onStateChange?.(true);

      /* Auto-stop safety after MAX_DURATION_MS */
      autoStopRef.current = setTimeout(() => {
        recognition.stop();
      }, VOICE.MAX_DURATION_MS);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join("")
        .trim();

      if (event.results[event.results.length - 1].isFinal) {
        onTranscript?.(transcript);
      }
    };

    recognition.onerror = (event) => {
      clearTimeout(autoStopRef.current);
      setIsListening(false);
      onStateChange?.(false);

      switch (event.error) {
        case "not-allowed":
          setErrorMsg(ERRORS.VOICE_DENIED);
          break;
        case "no-speech":
          setErrorMsg("No speech detected. Try again.");
          break;
        case "network":
          setErrorMsg("Network error during speech recognition.");
          break;
        default:
          setErrorMsg(`Voice error: ${event.error}`);
      }

      /* Clear error after 3 seconds */
      setTimeout(() => setErrorMsg(""), 3000);
    };

    recognition.onend = () => {
      clearTimeout(autoStopRef.current);
      setIsListening(false);
      onStateChange?.(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript, onStateChange]);


  /* ── Stop recording ── */
  const stopListening = useCallback(() => {
    clearTimeout(autoStopRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    onStateChange?.(false);
  }, [onStateChange]);


  /* ── Toggle ── */
  const toggle = useCallback(() => {
    if (isListening) stopListening();
    else             startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, isSupported, errorMsg, toggle, stopListening };
}


/* ══════════════════════════════════════════════════════════
   WAVEFORM VISUAL (shown while recording)
   ══════════════════════════════════════════════════════════ */

function VoiceWaveform() {
  return (
    <div className="voice-waveform">
      {[10, 18, 24, 18, 10].map((h, i) => (
        <span
          key={i}
          style={{
            height:         h,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   MAIN VOICE BUTTON COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function VoiceButton({ onTranscript, onStateChange, disabled }) {
  const {
    isListening,
    isSupported,
    errorMsg,
    toggle,
  } = useSpeechRecognition({ onTranscript, onStateChange });

  /* Don't render if speech not supported in this browser */
  if (!isSupported) return null;

  return (
    <div style={s.wrapper}>

      {/* Error tooltip */}
      {errorMsg && (
        <div style={s.errorToast}>
          {errorMsg}
        </div>
      )}

      {/* Waveform — shown while listening */}
      {isListening && <VoiceWaveform />}

      {/* Mic button */}
      <button
        className={`glass-mic-btn ${isListening ? "recording" : ""}`}
        style={{
          ...s.micBtn,
          background: isListening
            ? "linear-gradient(135deg,#f472b6,#a855f7)"  // pink when active
            : "linear-gradient(135deg,#a78bfa,#7c3aed)", // purple when idle
          cursor: disabled && !isListening ? "not-allowed" : "pointer",
          opacity: disabled && !isListening ? 0.5 : 1,
        }}
        onClick={toggle}
        disabled={disabled && !isListening}
        aria-label={isListening ? "Stop recording" : "Start voice input"}
        title={isListening ? "Tap to stop" : "Tap to speak"}
      >
        {isListening
          ? <IoStopCircle  size={20} color="#fff" />
          : <IoMicOutline  size={20} color="#fff" />
        }
      </button>

      {/* Injected keyframes for pulse ring */}
      <style>{`
        @keyframes micRipple {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .glass-mic-btn.recording::before {
          content:       '';
          position:      absolute;
          inset:         0;
          border-radius: 50%;
          border:        2px solid rgba(244,114,182,0.70);
          animation:     micRipple 1.2s ease-out infinite;
          pointer-events:none;
        }
        .glass-mic-btn {
          position: relative;
        }
      `}</style>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = {
  wrapper: {
    display:     "flex",
    alignItems:  "center",
    gap:         8,
    position:    "relative",
    flexShrink:  0,
  },

  micBtn: {
    width:           44,
    height:          44,
    borderRadius:    "50%",
    border:          "none",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
    boxShadow:       "0 4px 16px rgba(124,58,237,0.40)",
    transition:      "background 0.3s ease, opacity 0.2s ease, transform 0.15s ease",
  },

  errorToast: {
    position:     "absolute",
    bottom:       "110%",
    right:        0,
    background:   "rgba(248,113,113,0.92)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color:        "#fff",
    fontSize:     "0.72rem",
    fontFamily:   "var(--font-body)",
    padding:      "6px 10px",
    borderRadius: "var(--radius-sm)",
    whiteSpace:   "nowrap",
    boxShadow:    "0 4px 12px rgba(0,0,0,0.15)",
    animation:    "fadeUp 0.2s ease both",
    zIndex:       10,
  },
};
