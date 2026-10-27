# Mr.INIX Backend 🧠

The Python (Flask) brain of **Mr.INIX**, a futuristic AI assistant. It receives messages from the React app, decides how to answer, and sends back JSON. It runs happily on a phone inside **Termux** and needs no PC.

> Save this file as `backend/README.md`.

---

## What it does

| Feature | Endpoint | Works without an API key? |
|---|---|---|
| Chat with built-in replies | `POST /chat` | ✅ Yes |
| Chat with a real AI model | `POST /chat` | Needs `MRINIX_AI_KEY` and `MRINIX_AI_MODEL` |
| Remembers facts about you | via chat commands | ✅ Yes |
| Chemistry answers (elements, molar mass) | via chat | ✅ Yes |
| Image creation | `POST /image` | ✅ Yes (free third-party service) |
| Translation | `POST /translate` | ✅ Yes (free third-party service, daily limit) |
| Speech to text (optional fallback) | `POST /voice` | Needs `OPENAI_API_KEY` |
| Health check | `GET /` | ✅ Yes |

---

## Folder structure

```
backend/
├── app.py                 Flask app, loads everything below
├── requirements.txt
├── .env                   your secrets (you create it, never commit it)
│
├── routes/                one file per endpoint
│   ├── chat.py            POST /chat
│   ├── image.py           POST /image
│   ├── voice.py           POST /voice
│   └── translate.py       POST /translate
│
├── ai/                    the "brain"
│   ├── chatbot.py         decides how to answer
│   ├── memory.py          long-term facts about you
│   ├── prompts.py         Mr.INIX's personality and rules
│   └── chemistry_ai.py    offline element and molar-mass answers
│
├── utils/
│   ├── config.py          loads .env, validates settings
│   ├── helpers.py         shared helper functions
│   └── security.py        rate limits, size limit, safe headers
│
└── database/
    └── db.py              creates the SQLite files (chats.db, memory.db)
```

Every folder (`routes`, `ai`, `utils`, `database`) needs an **empty `__init__.py`** file so Python can import from it.

---

## Quick start (Termux)

**1. Install Python**
```bash
pkg update && pkg install python
```

**2. Install the dependencies** (run inside `backend/`)
```bash
pip install -r requirements.txt
```

**3. Start the server**
```bash
python app.py
```

You should see a summary like this:
```
======================================================
  Mr.INIX Flask Backend
  Listening : http://0.0.0.0:5000
  AI        : basic mode (set MRINIX_AI_KEY and MRINIX_AI_MODEL)
  Debug     : off (MRINIX_DEBUG=1 for auto-reload)
  .env file : not found (optional)
  LAN IP    : ip addr | grep 'inet 192'
======================================================
```
Followed by `Loaded routes.chat`, `Loaded routes.image` and so on. A `WARNING: could not load ...` line means a file is missing or misplaced.

**4. Test it** (open a second Termux session)
```bash
curl http://127.0.0.1:5000/

curl -X POST http://127.0.0.1:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```
Expected:
```json
{"reply": "Hello! I'm Mr.INIX. How can I help you today?"}
```
In the server terminal you'll see `--> POST /chat` and `<-- 200 /chat`. **If you see these lines, the backend is working.**

---

## Connecting the React frontend

The React app calls relative URLs like `/chat`, and the Create React App dev server forwards them to Flask using the `proxy` line in `frontend/package.json`:

```json
"proxy": "http://192.0.0.4:5000"
```

- Use your own LAN IP, found with `ip addr | grep "inet 192"`.
- If React and Flask both run in Termux on the **same phone**, `"proxy": "http://127.0.0.1:5000"` also works and never breaks when your IP changes.
- Restart `npm start` after changing `package.json`.

---

## Configuration

Create `backend/.env` (plain text, one `NAME=value` per line):

```
MRINIX_DEBUG=1
MRINIX_AI_KEY=your-api-key
MRINIX_AI_MODEL=model-name-from-your-provider
```

Priority: `export NAME=value` in Termux **beats** `.env`, which beats the defaults.

| Variable | Default | Purpose |
|---|---|---|
| `MRINIX_HOST` | `0.0.0.0` | Address to listen on (`0.0.0.0` = reachable from your network) |
| `MRINIX_PORT` | `5000` | Server port |
| `MRINIX_DEBUG` | off | `1` enables auto-reload. Leave off on shared Wi-Fi |
| `MRINIX_CORS_ORIGINS` | `*` | Allowed frontend addresses, comma separated |
| `MRINIX_AI_KEY` | none | API key for the AI model |
| `MRINIX_AI_MODEL` | none | Model name (copy a current one from your provider's docs) |
| `MRINIX_AI_URL` | Gemini OpenAI-compatible endpoint | Change to use another provider |
| `MRINIX_SAVE_CHATS` | off | `1` saves chat history in `chats.db` |
| `MRINIX_RATE_LIMIT` | on | `off` disables rate limits (testing only) |
| `MRINIX_MYMEMORY_EMAIL` | none | Optional email that raises the free translation quota |
| `OPENAI_API_KEY` | none | Enables `/voice` speech to text |
| `MRINIX_STT_URL`, `MRINIX_STT_MODEL` | OpenAI defaults | Speech service address and model |
| `MRINIX_IMAGE_BASE`, `MRINIX_IMAGE_MODEL` | Pollinations, `flux` | Image service settings |
| `MRINIX_MEMORY_DB` | `database/memory.db` | Location of the memory database |

> ⚠️ **Never upload `.env` to GitHub.** It holds your API keys. The project `.gitignore` excludes it.

---

## API reference

All replies are JSON. Errors always look like `{ "error": "message" }`.

### `GET /`
Health check. Returns `{"app": "Mr.INIX", "status": "online", "version": "1.0.0"}`.

### `POST /chat`
```json
{ "message": "Hello!", "history": [ {"role": "user", "content": "..."} ] }
```
Returns `{ "reply": "..." }`. `history` is optional (last 20 messages are used). Messages are limited to 2000 characters.

### `POST /image`
```json
{ "prompt": "a glowing purple orb", "width": 1024, "height": 1024 }
```
Returns `{ "image_url": "https://...", "prompt": "..." }`. Open the URL to see the picture. `width` and `height` are optional (256 to 1536). Prompts are limited to 500 characters.

### `POST /translate`
```json
{ "text": "Good morning", "target_lang": "es", "source_lang": "en" }
```
Returns `{ "translated_text": "...", "source_lang": "en", "target_lang": "es" }`. `source_lang` is optional (`auto`). Text is limited to 2000 characters, and the free service has a daily limit.

### `POST /voice`
Multipart form upload with an `audio` file (webm, wav, mp3, m4a, ogg, mp4; max 5 MB). Returns `{ "transcript": "..." }`. Replies `501` until `OPENAI_API_KEY` is set. **The app's mic button uses the browser's own speech recognition and does not need this route.**

---

## Connecting a real AI model

Without a key, Mr.INIX answers simple questions with built-in replies. For full answers, add two lines to `.env`:

```
MRINIX_AI_KEY=your-api-key
MRINIX_AI_MODEL=model-name-from-your-provider
```

- The default address is Google Gemini's OpenAI-compatible endpoint.
- Any provider that offers a `/chat/completions` API works: set `MRINIX_AI_URL` to its base address.
- There is **no default model name** on purpose, because providers rename models often. A wrong name shows up as an HTTP 404 in the Termux log.
- If the AI service fails, you get the built-in reply plus a short notice, and the real error is printed in the log.

Change Mr.INIX's personality in `ai/prompts.py`.

---

## Things you can say in the chat

**Memory** (saved on your device in `memory.db`)

| You say | Result |
|---|---|
| `My name is Sam` | Saves your name |
| `Remember that I prefer short answers` | Saves a fact |
| `What do you remember about me?` | Lists saved facts |
| `Forget my name` / `Forget that ...` | Removes matching facts |
| `Forget everything` | Clears all memory |

Up to 50 facts. Passwords, API keys and secrets are refused on purpose.

**Chemistry** (offline, instant)

| You say | Result |
|---|---|
| `atomic number of gold` | Name, symbol, number, atomic mass |
| `molar mass of Ca(OH)2` | Total plus a per-element breakdown |
| `molar mass of glucose` | About 30 common compounds are built in |

Formulas are case-sensitive (`NaCl` works, `nacl` does not). Anything else about chemistry goes to the AI model.

---

## Security and limits

| Protection | Details |
|---|---|
| Rate limits (per device, per minute) | `/chat` 30, `/image` 10, `/translate` 20, `/voice` 10, others 60. `GET /` is never limited |
| Request size | Bodies over 6 MB are rejected |
| Safe headers | `nosniff`, no framing, no referrer, no caching |
| Debug mode | Off by default so Flask's debugger is not open to your network |

Limits are kept in memory and reset when the server restarts. This protects you from accidents and casual misuse on your own network. If you ever host this on the public internet, add a login system and a firewall.

---

## Database

SQLite files are created automatically in `backend/database/`:

- `memory.db`: facts Mr.INIX remembers about you.
- `chats.db`: chat history. **Off by default** (your chats already live in the app). Turn on with `MRINIX_SAVE_CHATS=1`. The newest 5000 messages are kept.

There is no `users.db` because the app has no login.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Send button does nothing, no `--> POST /chat` in the server log | The request never reaches Flask | Check the `proxy` line in `frontend/package.json`, restart `npm start`, and make sure Flask is running |
| `404 Route /chat not found` | `routes/chat.py` did not load | Look for `WARNING: could not load routes.chat` at startup. Check the file location and that `routes/__init__.py` exists |
| `ModuleNotFoundError: No module named 'ai'` (or `utils`, `routes`, `database`) | Missing `__init__.py` or wrong folder | Create the empty `__init__.py` and run `python app.py` from inside `backend/` |
| Online badge in the app is red | Flask is not reachable | Run `curl http://127.0.0.1:5000/` in Termux. If that works, fix the proxy address |
| `Too many requests. Please wait ...` | Rate limit reached | Wait the number of seconds shown |
| Answers say "basic mode" | No AI configured | Add `MRINIX_AI_KEY` and `MRINIX_AI_MODEL` to `.env`, restart |
| Log shows `AI service HTTP 404` | Wrong model name or address | Copy the exact model name from your provider's docs |
| `.env` changes are ignored | Server not restarted, or an `export` is overriding it | Restart. Run `env | grep MRINIX` to see exported values |
| `Address already in use` | Port 5000 is taken | Stop the old server (Ctrl+C) or set `MRINIX_PORT=5001` and update the proxy |
| Translation says daily limit reached | Free quota used up | Try again tomorrow, or set `MRINIX_MYMEMORY_EMAIL` |
| Image URL opens but is slow | Free image service is busy | Try again in a moment |

---

## Notes

- Requires Python 3.8 or newer.
- Image and translation use free third-party services that can be slow, rate-limited or change in future.
- Part of the Mr.INIX project. See the root `README.md` for the full picture.
