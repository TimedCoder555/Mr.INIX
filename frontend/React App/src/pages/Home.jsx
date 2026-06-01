import React from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FloatingOrb from "../components/FloatingOrb";
import SuggestionCards from "../components/SuggestionCards";
import ChatBox from "../components/ChatBox";
import VoiceButton from "../components/VoiceButton";

function Home() {
  return (
    <div className="home-page">

      <Navbar />

      <Hero />

      <FloatingOrb />

      <SuggestionCards />

      <div className="home-actions">
        <VoiceButton />
      </div>

      <ChatBox />

    </div>
  );
}

export default Home;