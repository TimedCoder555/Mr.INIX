import React from "react";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <h1 className="hero-title">
          Welcome to <span>Mr.INIX</span>
        </h1>

        <p className="hero-description">
          A futuristic AI assistant built to help you learn,
          create, code, solve problems, and explore new ideas.
        </p>

        <div className="hero-buttons">

          <button className="primary-btn">
            🚀 Start Chatting
          </button>

          <button className="secondary-btn">
            📖 Learn More
          </button>

        </div>

      </div>

    </section>
  );
}

export default Hero;