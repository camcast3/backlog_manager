# 🎮 Backlog Manager

A gamified video game backlog manager that tracks games from **all platforms** (new releases and retro classics alike). It captures *How Long to Beat* data, builds a **vibe profile** for every game you add, and makes managing your backlog feel like a game itself.

---

## Features

| Feature | Details |
|---|---|
| **Multi-platform** | PS5, Xbox, Switch, PC (Steam/Epic/GOG), mobile, retro — anything goes |
| **How Long to Beat** | Store Main Story / Main + Extras / Completionist hours per game |
| **Vibe Profiles** | Game-level tags: intensity (Chill → Brutal), story pace, mood/atmosphere |
| **Vibe Interview** | When you add a game, a short questionnaire captures *why* you want to play it and auto-generates personal mood tags |
| **Staleness Checks** | After 3 months of inactivity on a non-completed game, the app asks why you haven't picked it up |
| **Gamification** | XP, levels, and 20 achievements for adding, playing, completing games and more |
| **Toast celebrations** | Level-ups and achievement unlocks are announced with animated toasts |
| **Status tracking** | Want to Play → Playing → Completed / Dropped / On Hold |
| **Backlog stats** | Dashboard with counts, currently-playing, recent achievements, and an XP progress bar |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v6, Vite 5 |
| Backend | Node.js + Fastify 5 |
| Database | PostgreSQL 16 |
| Container | Docker + Docker Compose |

---

## Project Structure

```
backlog_manager/
├── backend/                  # Fastify API
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js           # postgres connection
│   │   │   ├── migrate.js         # migration runner
│   │   │   └── migrations/
│   │   │       ├── 001_initial_schema.sql
│   │   │       └── 002_seed_achievements.sql
│   │   ├── routes/
│   │   │   ├── games.js           # game library CRUD
│   │   │   ├── backlog.js         # backlog management
│   │   │   └── progress.js        # XP / achievements
│   │   ├── services/
│   │   │   ├── gamificationService.js  # XP, levels, achievements
│   │   │   └── vibeService.js          # vibe analysis, staleness checks
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Nav, AddGameModal, StalenessAlert, badges …
│   │   ├── context/          # ToastContext
│   │   ├── pages/            # Dashboard, BacklogPage, GameLibraryPage, ProgressPage
│   │   ├── services/api.js   # fetch wrappers for all API calls
│   │   └── App.jsx
│   └── package.json
└── docker-compose.yml
```

---

## Quick Start — Docker (recommended)

```bash
# 1. Clone
git clone https://github.com/cacarlt/backlog_manager.git
cd backlog_manager

# 2. Start everything
docker compose up --build
```

- **Frontend** → http://localhost:5173  
- **Backend API** → http://localhost:3001  
- **Health check** → http://localhost:3001/health

The backend container automatically runs database migrations on startup.

---

## Quick Start — Local Development

### Prerequisites

- Node.js ≥ 20
- PostgreSQL 16 running locally

### 1. Database

```bash
createdb backlog_manager
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # edit DATABASE_URL if needed
npm install
npm run migrate               # creates tables + seeds achievements
npm run dev                   # starts on :3001 with --watch
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                   # starts on :5173 with proxy to :3001
```

---

## Environment Variables

Create `backend/.env` (see `.env.example`):

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/backlog_manager
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173   # optional, defaults to this value
```

---

## API Reference

### Games (global data — not user-specific)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/games` | List all games (query: `search`, `platform`, `genre`, `vibe_intensity`) |
| `GET` | `/api/games/:id` | Get one game |
| `POST` | `/api/games` | Create / upsert a game |
| `PATCH` | `/api/games/:id` | Update game fields |
| `DELETE` | `/api/games/:id` | Delete game |
| `GET` | `/api/games/platforms/list` | Distinct platform list |

### Backlog (user-specific data)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/backlog` | List items (query: `status`, `platform`, `vibe_intensity`, `sort`) |
| `GET` | `/api/backlog/stats` | Counts by status + total hours |
| `GET` | `/api/backlog/staleness` | Items inactive for 3+ months |
| `GET` | `/api/backlog/:id` | Get one item (enriched) |
| `POST` | `/api/backlog` | Add game to backlog + run vibe interview |
| `PATCH` | `/api/backlog/:id` | Update status, hours, rating, notes |
| `DELETE` | `/api/backlog/:id` | Remove from backlog |
| `POST` | `/api/backlog/:id/staleness-response` | Submit a staleness check response |

#### Add to backlog — request body

```json
{
  "game_id": 1,
  "why_i_want_to_play": "I love a challenge and the open world looks incredible",
  "priority": 80,
  "interview_answers": {
    "mood": "Craving a serious challenge",
    "session": "Long weekend marathons",
    "why": "Friends won't stop talking about it"
  }
}
```

### Progress / Gamification

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/progress` | XP, level, counters, level progress % |
| `GET` | `/api/progress/achievements` | All achievements with earned status |
| `GET` | `/api/progress/activity` | Last 20 earned achievements |

---

## Gamification

- **XP awards**: +20 add game · +30 start playing · +150 complete · +5 drop  
- **Leveling**: quadratic curve — Level N requires N² × 100 cumulative XP  
- **20 achievements** covering milestones, vibes, platforms, hours, and more  
- All XP and achievement events are returned inline in the API response so the frontend can celebrate immediately

---

## Running Tests

```bash
cd backend
npm test
```

11 unit tests cover vibe analysis keyword detection and XP / leveling math.

---

## Data Model

| Table | Purpose |
|---|---|
| `games` | Global game records (title, platform, HLTB, vibe tags) |
| `backlog_items` | User's backlog entries linking to a game |
| `vibe_profiles` | Auto-generated vibe tags per backlog entry |
| `staleness_checks` | Log of staleness nudges and user responses |
| `achievements` | Achievement definitions |
| `earned_achievements` | Which achievements the user has unlocked |
| `user_progress` | Single-row XP / level / counter table |
