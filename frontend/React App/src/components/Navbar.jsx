import React from "react";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-left">

        <img
          src="/favicon.ico"
          alt="Mr.INIX Logo"
          className="navbar-logo"
        />

        <div>
          <h2 className="navbar-title">
            Mr.INIX
          </h2>

          <p className="navbar-subtitle">
            AI Assistant
          </p>
        </div>

      </div>

      <div className="navbar-right">

        <button className="settings-btn">
          ⚙️
        </button>

      </div>

    </nav>
  );
}

export default Navbar;