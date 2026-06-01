const API_BASE_URL = "https://api.openai.com/v1";

export async function sendMessage(message) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YOUR_API_KEY`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("API Error:", error);

    return {
      error: true,
      message: "Failed to connect."
    };
  }
} 