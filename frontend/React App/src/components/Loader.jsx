import React from "react";

function Loader() {
  return (
    <div className="loader-container">

      <div className="loader-orb">
        <div className="loader-ring ring1"></div>
        <div className="loader-ring ring2"></div>

        <div className="loader-core">
          INIX
        </div>
      </div>

      <h2 className="loader-title">
        Mr.INIX
      </h2>

      <p className="loader-text">
        Initializing AI Systems...
      </p>

    </div>
  );
}

export default Loader;