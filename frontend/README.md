# Mr.INIX Frontend ⚛️

The React app for **Mr.INIX**, a futuristic AI assistant. It has a glass-style purple design, a floating animated orb, suggestion cards and a full chat screen. It is built for phones and runs happily in **Termux**.

> Save this file as `frontend/README.md`.

---

## Stack

| Tool | Purpose |
|---|---|
| React 18 + Create React App (`react-scripts` 5) | The app and dev server |
| `react-router-dom` 6 | Pages: Home, Chat, About, Settings |
| `react-icons` 5 | Icons |
| Plain CSS (4 files) | Glass design, animations, no UI library |

No other runtime dependencies. The browser's built-in Web Speech API handles the microphone.

---

## Quick start

You need the backend running first (see `backend/README.md`).

```bash
cd frontend
npm install        # first time only, can take several minutes on a phone
npm start
```

Then open **http://localhost:3000** in the browser on the same phone.

| Command | What it does |
|---|---|
| `npm start` | Dev server on port 3000 with live reload |
| `npm run build` | Production build into `build/` |
| `PORT=3001 npm start` | Use another port if 3000 is busy |

---

## Connecting to the backend

The app calls relative URLs such as `/chat`. In development, the dev server forwards them to Flask using the `proxy` line in `package.json`:

```json
"proxy": "http://192.0.0.4:5000"
```

- If React and Flask both run on the **same phone**, use `"proxy": "http://127.0.0.1:5000"`. It never breaks when your Wi-Fi address changes.
- Otherwise use your Flask machine's address (`ip addr | grep "inet 192"` in Termux).
- **Restart `npm start` after editing `package.json`.**

**No restart needed alternative:** open **Settings, Server, Flask Server IP**, type the address (for example `192.0.0.4:5000`) and press Save. The app then talks to that address directly and skips the proxy. Leave the field empty to go back to the proxy.

> Production builds have no proxy. See [Deploying](#deploying).

---

## Pages

| Route | Page | What it shows |
|---|---|---|
| `/` | Home | Greeting, orb, 4 suggestion cards, input bar |
| `/chat` | Chat | Full conversation |
| `/about` | About | Features, tech stack, status |
| `/settings` | Settings | Name, voice, display, server, data |
| anything else | | Redirects to `/` |

On a narrow screen, tapping the Home input opens the Chat page, where you type.

---

## Settings

Everything on the Settings page changes real behavior and is remembered on your device.

| Setting | Effect |
|---|---|
| Display Name | Greeting on Home ("Hello, Sam!") |
| Voice Input | Shows or hides the microphone button |
| Chat Font Size | Small, Medium or Large text in chat bubbles |
| Auto-scroll | When on, chat opens and follows the newest message |
| Flask Server IP | Optional direct backend address (empty = proxy) |
| Test Connection | Checks the backend and updates the Online badge |
| Clear Chat History | Deletes all messages (tap twice to confirm) |
| Factory Reset | Clears everything the app stored (tap twice to confirm) |

---

## Folder structure

```
frontend/
├── package.json
├── public/
│   ├── index.html            page shell, fonts, mobile meta tags
│   └── favicon.ico           add your own icon (see Notes)
└── src/
    ├── index.js              entry point: loads CSS, mounts <App />
    ├── App.js                routes + global state (useApp)
    │
    ├── pages/
    │   ├── Home.jsx          orb + greeting + cards + input bar
    │   ├── Chat.jsx          navbar + compact orb + ChatBox
    │   ├── About.jsx
    │   └── Settings.jsx
    │
    ├── components/
    │   ├── Navbar.jsx        top bar and slide-out menu
    │   ├── FloatingOrb.jsx   animated orb (idle, listening, thinking, speaking)
    │   ├── SuggestionCards.jsx
    │   ├── ChatBox.jsx       messages, input, sending
    │   ├── VoiceButton.jsx   microphone (Web Speech API)
    │   ├── SettingsModal.jsx quick settings sheet
    │   └── Loader.jsx        startup screen, spinner, skeleton
    │
    ├── utils/
    │   ├── api.js            every call to Flask lives here
    │   ├── helpers.js        time, text, storage and scroll helpers
    │   └── constants.js      names, routes, limits, suggestion cards
    │
    └── styles/
        ├── global.css        colors, fonts, background (CSS variables)
        ├── animations.css    all keyframes
        ├── glass.css         frosted-glass components and chat bubbles
        └── chat.css          chat layout
```

---

## How sending a message works

```
You type and press Send (or Enter)
  -> ChatBox adds your bubble and shows the typing dots
  -> api.js sendChat() posts { message, history } to /chat
  -> Flask answers { reply }
  -> ChatBox adds the reply bubble
```

If something goes wrong, the error appears as a chat bubble, for example *"Cannot reach Mr.INIX server. Is Flask running?"*. Your chat history is saved in the browser and survives reloads.

---

## Customizing

| I want to change... | Edit |
|---|---|
| Colors | CSS variables at the top of `styles/global.css` |
| App name and tagline | `APP` in `utils/constants.js` |
| The 4 suggestion cards | `SUGGESTIONS` in `utils/constants.js` (icons are in `SuggestionCards.jsx`) |
| Message length limit, placeholder | `CHAT` in `utils/constants.js` |
| Request timeout | `API.TIMEOUT_MS` in `utils/constants.js` |

---

## Using the app state

Any component can read the shared state:

```jsx
import { useApp } from "../App";

const { userName, messages, isOnline, voiceEnabled, clearHistory } = useApp();
```

Data the app stores in your browser (`localStorage`): `mrinix_user_name`, `mrinix_chat_history`, `mrinix_voice_enabled`, `mrinix_fontsize`, `mrinix_autoscroll`, `mrinix_custom_ip`.

---

## Deploying

`npm run build` creates a `build/` folder you can host anywhere (Netlify, GitHub Pages, ...). Three things to know:

1. **There is no proxy in production.** Set the backend address when you build:
   ```bash
   REACT_APP_API_URL=https://your-backend.example.com npm run build
   ```
   The backend must be reachable from the internet over **HTTPS** (a Flask server running on your phone is not). Set `MRINIX_CORS_ORIGINS` on the backend to your site's address.
2. **Page refresh on `/chat` shows 404 on Netlify** unless you add a file `public/_redirects` containing:
   ```
   /*  /index.html  200
   ```
3. **CI builds treat warnings as errors.** If a hosting build fails with "Treating warnings as errors because process.env.CI = true", use `CI=false npm run build` as the build command.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Send does nothing and the Flask terminal shows no `POST /chat` | Request does not reach Flask | Check `proxy` in `package.json`, restart `npm start`, make sure Flask is running |
| Bubble says "Cannot reach Mr.INIX server" | Flask is not running or the address is wrong | Start Flask. In Settings press **Test Connection** |
| Online badge is red | Backend unreachable at startup | Start Flask, then press **Test Connection** in Settings |
| Bubble says "Too many requests" | Backend rate limit | Wait the seconds shown |
| No microphone button | Voice is off in Settings, or the browser has no speech recognition | Turn on Voice Input; use Chrome on Android |
| "Microphone permission denied" | Browser blocked the mic | Allow microphone for the site in browser settings |
| Greeting says "Hello, There!" | No name saved yet | Settings, Display Name |
| Changes to `package.json` ignored | Dev server still running the old config | Stop and run `npm start` again |
| Port 3000 already in use | Another dev server is running | Stop it or use `PORT=3001 npm start` |

---

## Notes and limits

- **Add a favicon.** `index.html` points to `public/favicon.ico`, which you need to supply (any `.ico` file). Without it the browser just shows a 404 for the icon.
- **Cards send a starter sentence.** "Create an image" and "Translate the text" start a chat with a prompt. `api.js` already has `generateImage()` and `translateText()` for the backend, but the chat screen does not display images or call translation directly yet.
- **No dark theme yet.** Colors are defined as CSS variables, so adding one is straightforward.
- **No automated tests are included.**
- Part of the Mr.INIX project. See the root `README.md` for the full picture.
