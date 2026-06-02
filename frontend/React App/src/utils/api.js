const API_URL = "http://127.0.0.1:5000/chat";

export async function sendMessage(message) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();

    return data.reply;

  } catch (error) {

    console.error(error);

    return "Mr.INIX server is offline.";
  }
}