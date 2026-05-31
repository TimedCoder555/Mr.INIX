import React from "react";

function SuggestionCards() {
  const suggestions = [
    "What is Artificial Intelligence?",
    "Explain Quantum Computing",
    "Write Python Code",
    "Create a Website",
    "Learn React.js",
    "How does ChatGPT work?"
  ];

  return (
    <div className="suggestion-container">

      <h3 className="suggestion-title">
        💡 Suggested Questions
      </h3>

      <div className="suggestion-grid">

        {suggestions.map((item, index) => (
          <button
            key={index}
            className="suggestion-card"
          >
            {item}
          </button>
        ))}

      </div>

    </div>
  );
}

export default SuggestionCards;