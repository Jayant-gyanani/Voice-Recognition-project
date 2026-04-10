<div align="center">

<img src="public/logo.png" alt="lords" hight="100px" width="120px">
<br>
<img src="https://img.shields.io/badge/VoiceAuth-VRaaS-4f46e5?style=for-the-badge&logo=googleassistant&logoColor=white" alt="VoiceAuth"/>

# 🎙️ VoiceAuth

### Voice Recognition as a Service

**Register your voice once. Log in to anything.**

VoiceAuth is a biometric authentication platform — think *"Sign in with Google"*, but your voice is the password. Users register once, developers integrate with a single API key, and authentication happens in seconds through a familiar popup flow.

<br/>

![Angular](https://img.shields.io/badge/Angular_19-DD0031?style=flat-square&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Python](https://img.shields.io/badge/Python_3-3776AB?style=flat-square&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>

---

## 📖 Table of Contents

- [What is VoiceAuth?](#-what-is-voiceauth)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Accounts & Roles](#-accounts--roles)
- [Developer Integration Guide](#-developer-integration-guide)
- [API Reference](#-api-reference)
- [Voice Recognition Pipeline](#-voice-recognition-pipeline)
- [Screenshots](#-screenshots)

---

## 🧠 What is VoiceAuth?

VoiceAuth is a **Voice Recognition as a Service (VRaaS)** platform. It solves a simple problem: voice biometric authentication is powerful, but building it from scratch is extremely complex.

VoiceAuth handles all of that complexity — the recording, the AI model, the matching, the session management — so developers can add voice login to their apps with just **one API call and one API key**.

```
Without VoiceAuth:  Build audio pipeline + train ML model + manage embeddings + handle sessions...
With VoiceAuth:     POST /api/v1/session/create  →  open popup  →  done ✓
```

---

## ⚙️ How It Works

### For Users

```
1. Sign Up          →    2. Record Voice         →    3. Use Anywhere
Fill in your             Say 3 sentences               Any site using VoiceAuth
name, email,             into the mic. VoiceAuth        will recognise you
photo & password         builds your voice profile      with a quick popup
```

### For Developers

```
1. Create Account   →    2. Create Project       →    3. Add Your API Key
Log in to VoiceAuth       Get a Project ID &            Paste it in your site.
developer portal          unique API Key                Users speak, you get
                                                        their full profile back
```

### The Popup Flow (just like Sign in with Google)

```
Your Website                    VoiceAuth Server              Popup Window
     │                                │                            │
     ├─ POST /api/v1/session/create ──►                            │
     │       header: x-api-key        │                            │
     │◄─ { verifyUrl: "/verify/..." } ┤                            │
     │                                │                            │
     ├─ window.open(verifyUrl) ──────────────────────────────────►│
     │                                │                            │ user speaks
     │                                │◄─ POST /api/verify/analyze─┤
     │                                ├──── result ───────────────►│
     │                                │                            │ postMessage
     │◄──────── message event: { type: 'VOICE_AUTH_RESULT' } ──────┤
     │                                │                            X closes
     │
     └─ show user: { name, email, dob, gender, photo, uniqueId }
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 19 — standalone components, Signals, Angular SSR |
| **Backend** | Node.js + Express (inside Angular SSR's `server.ts`) |
| **Voice AI** | Python — `resemblyzer`, `librosa`, `noisereduce`, `scipy` |
| **Auth** | JWT (JSON Web Tokens) |
| **Database** | In-memory (arrays/maps) + `users.json` for persistence |
| **Audio** | Browser `MediaRecorder` API → base64 → ffmpeg → WAV |
| **Styling** | Tailwind CSS + Angular Material |

---

## 📁 Project Structure

```
VoiceAuth/
│
├── src/
│   ├── server.ts                   ← All Express API routes + SSR server
│   └── app/
│       ├── pages/
│       │   ├── landing.ts          ← Home / marketing page
│       │   ├── login.ts            ← Login page
│       │   ├── signup.ts           ← Registration + 3 voice sample recording
│       │   ├── dashboard.ts        ← User dashboard (profile, connected apps)
│       │   ├── developer.ts        ← Developer console (projects, API keys)
│       │   ├── project-details.ts  ← Manage users in a project
│       │   ├── admin-dashboard.ts  ← Admin panel + live voice detection
│       │   ├── test-dashboard.ts   ← Test account with raw API response view
│       │   └── verify.ts          ← Voice verification popup page
│       └── components/
│           └── theme-toggle.ts     ← Light / dark mode toggle
│
├── voice_engine.py                 ← Python AI voice recognition script
│
├── uploads/                        ← Auto-created on first run
│   ├── VRU_xxxxxxxx_1.wav          ← User voice samples (3 per user)
│   ├── VRU_xxxxxxxx_2.wav
│   ├── VRU_xxxxxxxx_3.wav
│   └── test/
│       └── test.wav                ← Temporary file for live recognition
│
├── users.json                      ← Persistent user storage
├── voice_engine.py                 ← Python voice recognition script
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have all of these installed:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **Python 3.8+** — [python.org](https://python.org)
- **ffmpeg** — required for audio conversion
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/voiceauth.git
cd voiceauth
```

### 2 — Install Node dependencies

```bash
npm install
```

### 3 — Install Python dependencies

```bash
pip install resemblyzer librosa noisereduce scipy numpy
```

> ⚠️ `resemblyzer` will download a pretrained voice encoder model (~17 MB) on first run. This is normal.

### 4 — Start the development server

```bash
npm run dev
# or
npm start
```

The app will be available at **[http://localhost:4200](http://localhost:4200)**

> The server also listens on port **4000** for SSR builds (`npm run serve:ssr:app`)

---

## 👤 Accounts & Roles

VoiceAuth has two distinct account types built in:

### 🟢 Normal User
- Sign up at `/signup`
- Records 3 voice samples during registration
- Gets a unique ID in the format `VRU_xxxxxxxx`
- Can edit profile, retrain voice model, and see which projects they have access to
- Can switch to the Developer tab to create their own projects

### 🔵 Developer (same account, different tab)
- Any normal user can access the Developer Console from their dashboard
- Create projects → receive a **Project ID** and **API Key**
- Add/remove registered users from the project's allowed list
- Use the API Key in external websites to enable voice login


## 🔌 Developer Integration Guide

Follow these steps to add VoiceAuth to your own website.

### Step 1 — Create a project

1. Log in to VoiceAuth
2. Go to the **Developer** tab
3. Click **New Project** — you'll get a **Project ID** and **API Key**
4. Click on the project → add user IDs (`VRU_xxxxxxxx`) to the allowed list

### Step 2 — Add this to your website

Create an `index.html` (or add to your existing page):

```html
<button onclick="startVoiceAuth()">🎙️ Sign in with Voice</button>

<script>
  const API_KEY      = 'VR_API_xxxxxxxx';   // ← paste your key here
  const VRAAS_URL    = 'http://localhost:4200';

  async function startVoiceAuth() {
    // 1. Create a session
    const resp = await fetch(`${VRAAS_URL}/api/v1/session/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY }
    });
    const { verifyUrl } = await resp.json();

    // 2. Open the VoiceAuth popup
    window.open(`${VRAAS_URL}${verifyUrl}`, 'VoiceAuth',
      'width=480,height=640,resizable=no');

    // 3. Listen for the result
    window.addEventListener('message', function handler(event) {
      if (event.data?.type !== 'VOICE_AUTH_RESULT') return;
      window.removeEventListener('message', handler);

      const result = event.data.result;

      if (result.outcome === 'access_granted') {
        console.log('✅ User verified:', result.user);
        // result.user = { uniqueId, name, email, dob, gender, image }
      } else if (result.outcome === 'access_denied') {
        console.log('🚫 User recognised but not authorised');
      } else {
        console.log('❌ Voice not recognised');
      }
    });
  }
</script>
```

### Step 3 — Handle the result

When voice recognition succeeds, `result.user` contains:

```json
{
  "uniqueId": "VRU_a1b2c3d4",
  "name":     "Jane Doe",
  "email":    "jane@example.com",
  "dob":      "1998-04-15",
  "gender":   "female",
  "image":    "data:image/jpeg;base64,..."
}
```

> **Three possible outcomes:**
> - `access_granted` — voice matched, user is on the allowed list → full profile returned ✅
> - `access_denied` — voice matched, but user is NOT on the allowed list 🚫
> - `not_recognised` — voice did not match any registered user ❌

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Body / Headers | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/auth/signup` | `{ name, email, password, dob, gender, photo, voiceSamples[] }` | Register a new user |
| `POST` | `/api/auth/login` | `{ identifier, password }` | Login — returns JWT token |

### Developer API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/developer/projects` | Bearer JWT | List all projects |
| `POST` | `/api/developer/projects` | Bearer JWT | Create a new project |
| `DELETE` | `/api/developer/projects/:id` | Bearer JWT | Delete a project |
| `GET` | `/api/developer/projects/:id/users` | Bearer JWT | List authorised users |
| `POST` | `/api/developer/projects/:id/users` | Bearer JWT | Add user to project |
| `DELETE` | `/api/developer/projects/:id/users/:userId` | Bearer JWT | Remove user from project |

### Voice Verification (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/session/create` | `x-api-key` header | Create a verify session |
| `GET` | `/api/verify/session/:id` | None | Check session validity |
| `POST` | `/api/verify/analyze` | None | Submit voice sample for recognition |

### User Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/user/apps` | Bearer JWT | Get projects user has access to |
| `PUT` | `/api/user/profile` | Bearer JWT | Update profile details |
| `PUT` | `/api/user/voice` | Bearer JWT | Re-record voice samples |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/users` | Bearer JWT (admin) | List all registered users |
| `DELETE` | `/api/admin/users/:id` | Bearer JWT (admin) | Delete a user + voice files |
| `POST` | `/api/admin/voice-detect` | Bearer JWT (admin) | Run live voice recognition |
| `POST` | `/api/test/voice-detect` | Bearer JWT (test) | Test account voice recognition |

---

## 🧬 Voice Recognition Pipeline

This is what happens inside `voice_engine.py` every time a voice is tested:

```
1. LOAD DATABASE
   ├── Scan uploads/ for all VRU_xxxxxxxx_1.wav, _2.wav, _3.wav files
   ├── For each file: librosa.load() → noise reduction → normalize → trim silence
   ├── Generate a 256-dim speaker embedding via resemblyzer VoiceEncoder
   └── Average the 3 embeddings → one profile vector per user

2. LOAD TEST AUDIO
   ├── Same preprocessing pipeline as above
   └── Generate embedding for the test sample

3. MATCH
   ├── Compute cosine similarity: test_embedding vs each user's profile
   ├── Sort by score descending
   ├── If best score < 0.65 threshold  → "None|0"  (not recognised)
   ├── If margin from 2nd place < 0.03 → "None|0"  (ambiguous)
   └── Otherwise                       → "VRU_xxxx|0.876"

4. OUTPUT (stdout, read by Node.js)
   └── VRU_xxxxxxxx|0.876   or   None|0
```

**Key libraries:**

| Library | Role |
|---|---|
| `resemblyzer` | Generates 256-dimensional speaker embeddings from raw audio |
| `librosa` | Loads audio files, handles webm/wav/mp3, silence trimming |
| `noisereduce` | Spectral noise reduction before embedding |
| `scipy` | Cosine similarity computation |

---

## 💡 Key Design Decisions

**Why in-memory database?**
This is an academic/demo project. Replacing `usersDB` with PostgreSQL or MongoDB is straightforward — all data access is in `server.ts`.

**Why Python for voice recognition?**
The `resemblyzer` library (which uses a pretrained GE2E model from Google) is Python-only and produces excellent speaker embeddings with no training required.

**Why save users.json?**
The in-memory `usersDB` resets on server restart, but voice files persist on disk. `users.json` ensures the user database survives restarts without needing a real DB.

**Why a popup like Sign in with Google?**
It keeps the voice recording UI on the VoiceAuth domain, which means the developer's site never touches microphone data — only the verified result arrives via `postMessage`.

---

## 📋 Environment Notes

- Runs on **Windows 11** with `npm run dev` (tested)
- ffmpeg must be on system PATH for audio conversion
- Python must be accessible as `python` (not `python3`) from the command line on Windows
- Voice files persist between restarts; **delete `uploads/` and reset `users.json` to `[]`** for a clean slate
- Session tokens expire after **3 minutes** — users must complete verification in that window

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is made by — JAYANT GYANANI , KANIKA SHARMA , KOMAL KUMARI with a tradmark of <b>TM</b>J2K.

---

<div align="center">

Built with ❤️ using Angular, Node.js & Python

**[⭐ Star this repo if you found it useful!](https://github.com/Jayant-gyanani/Voice-Recognition-project)**

</div>
