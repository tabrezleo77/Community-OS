# Community Event OS

A role-based event management app — check-in scanning, agenda, volunteer board,
announcements, certificate generation, and organizer analytics.

Data is now persisted server-side (see **Architecture** below), so check-ins,
task updates, and announcements are shared across every device and survive
restarts.

## Requirements

- Node.js 18+

## Run locally

```bash
npm install
npm run dev
```

This starts two processes together (frontend on `http://localhost:3000`,
API on `http://localhost:8787`), with Vite proxying `/api` calls to the
backend. Open `http://localhost:3000`.

## Production build & run

```bash
npm install
npm run build     # builds the frontend into dist/
npm start          # serves the built frontend + API on one port
```

By default the server listens on port `8787` (override with the `PORT`
env var — most hosting platforms set this automatically). Open the app at
`http://localhost:<PORT>`.

## Deploying

This is a single Node.js process (Express) that serves both the API and the
built static frontend, so it works on any standard Node host: Render,
Railway, Fly.io, Heroku-style platforms, a VPS, etc.

1. Push this repo / upload it to your host.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Make sure the platform gives the app a persistent disk if you want
   check-in/task/announcement data to survive redeploys (see below).

### Data persistence

Event data lives in `server/data.json`, created automatically on first boot
from the seed data in `server/seed.json`. It is git-ignored on purpose —
each deployment gets a fresh copy on first run.

- **Good for:** a single event running on a normal always-on server/VM, or
  any platform with a persistent volume.
- **Not durable across redeploys on platforms with an ephemeral filesystem**
  (e.g. some serverless/container platforms wipe local files on every
  deploy). If you deploy somewhere ephemeral, either mount a persistent
  volume at `server/`, or swap the `readDB`/`writeDB` functions in
  `server/index.js` for a real database (Postgres, SQLite on a mounted
  volume, etc.) — the HTTP routes don't need to change.

### HTTPS

The check-in scanner's camera feature requires the site to be served over
HTTPS in production (browsers block camera access on plain HTTP for
non-localhost origins). Most hosting platforms provide this automatically.

## Architecture

- `src/` — React 19 + TypeScript frontend (Vite, Tailwind v4).
- `server/index.js` — Express API server. Endpoints:
  - `GET /api/state` — full app state
  - `POST /api/attendees/:id/checkin` / `.../uncheckin`
  - `PATCH /api/tasks/:id` — update a volunteer task's status
  - `POST /api/announcements` — post a new announcement
  - `GET /api/health` — health check
  - In production, also serves the built `dist/` frontend.
- `server/seed.json` — initial demo data (attendees, sessions, tasks,
  announcements) used to seed `server/data.json` on first run.
- The frontend polls `GET /api/state` every 5 seconds so changes made from
  other devices (e.g. a volunteer checking someone in) show up everywhere
  without a manual refresh.

## Customizing the event data

Edit `server/seed.json` before first boot (or edit `server/data.json`
directly at any time, then restart the server) to change attendees,
sessions, tasks, and announcements.
