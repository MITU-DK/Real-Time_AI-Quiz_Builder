# ⚡ QuizArena — Real-Time AI-Powered Quiz Platform

> A production-grade, full-stack multiplayer quiz application. Hosts generate complete quiz decks from any topic using AI in under 3 seconds, then run live game sessions where players compete in real-time from their own devices.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)

**🔗 [Live App](https://real-time-ai-quiz-builder.vercel.app/)** · **▶️ [Watch Demo](https://youtu.be/YTDhTV0_4sA)**

[![QuizArena Demo](https://img.youtube.com/vi/YTDhTV0_4sA/maxresdefault.jpg)](https://youtu.be/YTDhTV0_4sA)

---

## 🎯 What It Does

QuizArena is a **Kahoot-style real-time multiplayer quiz platform** with an AI-first content pipeline. It removes the manual effort of quiz creation entirely.

| Role   | Experience |
|--------|------------|
| **Host** | Logs in → Types a topic → AI generates a full quiz in seconds → Shares a PIN → Runs the live game |
| **Player** | Opens the join page → Enters the PIN → Taps colored answer buttons in real-time on their phone |

---

## ✨ Key Features

- 🤖 **AI Quiz Generation** — One-click generation using the Groq API (`llama-3.3-70b-specdec`) with strict JSON schema enforcement. Returns 3–10 questions with 4 options and a verified correct answer in under 3 seconds.
- ⚡ **Real-Time Multiplayer** — Full bidirectional WebSocket game loop via Socket.IO. All connected clients transition between game phases (lobby → countdown → question → results → leaderboard) simultaneously.
- ⏱️ **NTP-Style Clock Synchronization** — Server performs a 3-way NTP handshake with each client on join to calculate network latency and clock offset. The server sends an absolute UTC deadline (`tDeadline`) so every player's visible timer is perfectly synchronized, regardless of their network conditions.
- 🏆 **Score Decay Algorithm** — Points awarded use the formula `Score = ⌊(1 − R_time / (2 × Q_timer)) × P_max⌋`, rewarding faster correct answers with more points (max score → half score over the question window). All scoring is calculated server-side — the client's timer is purely visual.
- 🛡️ **Server-Side Anti-Cheat** — Answer submissions are validated against a server-managed UTC deadline stored in Redis. Any answer arriving after `tDeadline` is silently rejected, making client-side timer manipulation impossible.
- 🔄 **Graceful Reconnection** — A `reconnect` socket event allows a player who dropped their connection mid-game to rejoin the active room and have their score and position fully restored from Redis.
- 📊 **Live Answer Counter** — The host sees a real-time `[X / Y answered]` badge during every question, powered by a Redis `HINCRBY` counter broadcast over WebSockets.
- 🏁 **Early Question Termination** — The question ends immediately the moment the last player submits, without waiting for the countdown to expire.
- 📜 **Historical Results** — A dedicated REST endpoint (`GET /api/game/:pin/results`) lets hosts look up the final leaderboard of any past game long after the WebSocket session has ended.
- 🔒 **JWT Authentication** — Stateless token-based auth for all host actions (create quiz, host game, view results).

---

## 🏗️ Architecture & Technical Design

### The Hybrid Database Pattern

The most deliberate architectural decision in this project is the **dual-database model**:

- **PostgreSQL (System of Record):** All persistent data lives here — users, quiz templates, game session records, and per-player response logs for post-game analysis.
- **Redis (Real-Time Performance Engine):** All live game state lives here as transient data. Redis is used for:
  - `session:{pin}:state` — Hash storing current question index, `t_start`, `t_deadline`, and answer count.
  - `session:{pin}:leaderboard` — A Sorted Set (ZSET) for the live leaderboard. `ZINCRBY` updates are **O(log N)** and atomically thread-safe, making scores update in microseconds even under heavy load.
  - `room:{pin}:presence` — A Set of connected `playerIds` for presence tracking and early termination logic.
  - All game data is purged from Redis via `cleanupGame()` on session end to prevent memory leaks.

### The Background Game Scheduler

A 100ms polling loop runs independently of any client connection. It reads the `game_updates` sorted set in Redis (which stores game PINs keyed by their question deadline timestamp). When a deadline is crossed, `endQuestion()` fires automatically — this means the game loop is **decoupled from the host's socket connection**. The game continues and scores are calculated correctly even if the host closes their browser mid-question.

### Socket Event Flow

```
HOST                    SERVER                    PLAYERS
  |                       |                          |
  |-- join_as_host ------->|                          |
  |<- joined_as_host ------|                          |
  |                       |<-------- join_room -------|
  |<- player_joined (broadcast)                       |
  |                       |                          |
  |-- trigger_countdown -->|-- show_countdown ------->|
  |-- start_game --------->|                          |
  |                       |-- question_start -------->|
  |<- question_start ------|                          |
  |                       |<-------- submit_answer ---|
  |<- answer_count_updated (broadcast)                |
  |                       |                          |
  |     [scheduler fires on tDeadline]               |
  |<- question_end (broadcast) --------------------->|
  |<- leaderboard_update (broadcast) --------------->|
  |<- game_over (broadcast) ------------------------>|
```

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend** | React 18 + TypeScript + Vite | Component-based UI for complex phase-driven game states |
| **State Management** | Zustand | Lightweight global store for real-time game state without Redux boilerplate |
| **Styling** | Tailwind CSS | Utility-first rapid prototyping with a consistent design system |
| **Real-Time** | Socket.IO (client) | Stable WebSocket connection with automatic reconnection and fallbacks |
| **Backend** | Node.js + Express + TypeScript | Non-blocking I/O, ideal for high-concurrency socket handling |
| **WebSockets** | Socket.IO (server) | Manages rooms, namespaces, and broadcasting with Redis adapter support |
| **Primary DB** | PostgreSQL + `node-postgres` | Relational storage for users, quizzes, sessions, and response analytics |
| **Cache / Game State** | Redis + `ioredis` | In-memory sorted sets and hashes for sub-millisecond leaderboard updates |
| **AI** | Groq SDK (`llama-3.3-70b-specdec`) | Hardware-accelerated LPU inference for near-instant structured JSON output |
| **Auth** | JWT + `bcrypt` | Stateless authentication with hashed passwords |
| **Rate Limiting** | `express-rate-limit` | 5 AI generation requests per IP per 5-minute window |

---

## 📁 Project Structure

```
Real-Time_AI-Quiz_Builder/
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── auth/         # register, login, /me
│       │   ├── quiz/         # generate (Groq AI), save, list, delete
│       │   └── game/         # host session, historical results
│       ├── socket/
│       │   └── handlers/
│       │       ├── connection.handler.ts    # join_room, join_as_host
│       │       ├── startGame.ts             # game start + countdown trigger
│       │       ├── advanceToQuestion.ts     # question broadcast logic
│       │       ├── submitAnswer.ts          # scoring, anti-cheat, early termination
│       │       ├── endQuestion.ts           # results + leaderboard broadcast
│       │       ├── reconnect.handler.ts     # mid-game reconnection
│       │       ├── sync.handler.ts          # NTP clock sync handshake
│       │       └── disconnect.handler.ts    # presence cleanup
│       ├── services/
│       │   ├── scheduler.ts        # 100ms background game loop
│       │   └── cleanup.service.ts  # Redis key purge on game over
│       ├── middleware/
│       │   ├── authMiddleware.ts   # JWT verification
│       │   └── rateLimiter.ts      # AI generation rate limiting
│       └── types/                  # Full TypeScript types for socket events & API
│
└── frontend/
    └── src/
        ├── pages/              # HostGamePage, PlayerGamePage, DashboardPage, PastResultsPage
        ├── components/
        │   ├── host/           # LobbyView, QuestionView, ResultsView, LeaderboardView, GameOverView
        │   ├── player/         # WaitingView, BuzzerView, ResultView
        │   └── shared/         # TimerBar, LeaderboardRow
        ├── hooks/
        │   ├── useGameSocket.ts  # All socket event listeners & state updates
        │   └── useSyncTimer.ts   # NTP-corrected countdown timer
        ├── store/
        │   └── useGameStore.ts   # Zustand global game state
        └── services/
            └── api.ts            # Typed REST API helpers
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- A [Groq API Key](https://console.groq.com/)

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/Real-Time_AI-Quiz_Builder.git
cd Real-Time_AI-Quiz_Builder

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**`backend/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/quizarena
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
PORT=3001
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Set up the database

```bash
# Run migrations (SQL files in backend/src/db/)
psql -U your_user -d quizarena -f backend/src/db/schema.sql
```

### 4. Start both servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` to access the app.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ JWT | Get current user |
| `GET` | `/api/quizzes` | ✅ JWT | List host's quizzes |
| `POST` | `/api/quizzes/generate` | ✅ JWT | AI-generate a quiz draft |
| `POST` | `/api/quizzes` | ✅ JWT | Save quiz to database |
| `DELETE`| `/api/quizzes/:id` | ✅ JWT | Delete a quiz |
| `POST` | `/api/game/host` | ✅ JWT | Create game session, get PIN |
| `GET` | `/api/game/:pin/results` | ✅ JWT | Fetch historical game results |

---

## 🧠 Engineering Challenges Solved

**1. The Clock Synchronization Problem**
In a multiplayer game, every player's device has a different clock. A naive timer that just counts down from 30 locally would allow players with slow clocks to submit answers after the server's deadline. The solution is an NTP-style handshake: the server records `t1` (when the sync request arrived) and `t2` (when it replied), the client calculates round-trip latency, and from there computes a precise `clockOffset`. The server then sends absolute UTC timestamps, and the client adjusts its local display timer accordingly.

**2. Race Conditions in Concurrent Answer Submissions**
When 50 players submit answers simultaneously, naive reads and writes to a shared counter would produce incorrect tallies. All counter updates use Redis's `HINCRBY` command, which is **atomically thread-safe** — no locking needed, no race condition possible.

**3. Host Dropout Resilience**
The entire question timer and game advancement logic runs server-side in a background scheduler, not inside the host's socket connection handler. If the host closes their browser mid-game, the timer fires, scores are computed, and all players advance to the results screen automatically.

---

## 📄 License

MIT — feel free to use this project as a reference or build on top of it.
