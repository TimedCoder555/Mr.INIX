🤖 Mr.INIX Backend

Mr.INIX Backend powers the AI assistant and handles API communication between the frontend and the AI brain.

Features

- Flask Backend
- REST API
- CORS Enabled
- Chat Endpoint
- AI Brain Ready
- Mobile Friendly

Installation

pip install -r requirements.txt

Run

python app.py

Server starts on:

http://localhost:5000

Endpoints

GET /

Returns backend status.

POST /chat

Example:

{
"message": "Hello Mr.INIX"
}

Response:

{
"success": true,
"reply": "Mr.INIX received: Hello Mr.INIX"
}

Developer

TimedCoder555

Discord:
https://discord.gg/TqV9BjSP

Version:
1.0.0