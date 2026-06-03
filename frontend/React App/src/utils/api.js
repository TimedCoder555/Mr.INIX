export async function sendMessage(message) {
  try {
    const res = await fetch("http://192.0.0.4:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await res.json();

    return data.reply;

  } catch (error) {
    console.log("API ERROR:", error);
    return "Backend not connected 😢";
  }
}