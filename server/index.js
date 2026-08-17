// Community Event OS — backend API server
// Persists all event data to a local JSON file (server/data.json) so that
// check-ins, task updates, and announcements survive restarts and are shared
// across every device hitting this server (real multi-user behavior).
//
// For higher traffic / concurrent-write-heavy deployments, swap the
// readDB/writeDB functions below for a real database (Postgres, SQLite, etc).
// The HTTP contract (the routes) can stay exactly the same.

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');
const SEED_FILE = path.join(__dirname, 'seed.json');
const DIST_DIR = path.join(__dirname, '..', 'dist');

const PORT = process.env.PORT || 8787;

// ---------- tiny file-based "database" ----------

function loadSeed() {
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  const now = Date.now();
  // Give checked-in seed attendees a real (recent) check-in timestamp,
  // and stagger the seed announcements so they look real on first boot.
  seed.attendees = seed.attendees.map((a, i) => ({
    ...a,
    checkInTime: a.status === 'Checked-In' ? new Date(now - (i + 1) * 900000).toISOString() : null,
  }));
  seed.announcements = seed.announcements.map((ann, i) => ({
    ...ann,
    timestamp: new Date(now - (seed.announcements.length - i) * 1800000).toISOString(),
  }));
  return seed;
}

function readDB() {
  if (!fs.existsSync(DATA_FILE)) {
    const seeded = loadSeed();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeDB(db) {
  // Write to a temp file then rename, to avoid corrupting data.json if the
  // process is killed mid-write.
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

// ---------- app ----------

const app = express();
app.use(express.json());

const router = express.Router();

// Full state, fetched once on load and whenever the client wants to resync.
router.get('/state', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Check in / undo check-in
router.post('/attendees/:id/checkin', (req, res) => {
  const db = readDB();
  const attendee = db.attendees.find(a => a.id === req.params.id);
  if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
  attendee.status = 'Checked-In';
  attendee.checkInTime = new Date().toISOString();
  writeDB(db);
  res.json(attendee);
});

router.post('/attendees/:id/uncheckin', (req, res) => {
  const db = readDB();
  const attendee = db.attendees.find(a => a.id === req.params.id);
  if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
  attendee.status = 'Registered';
  attendee.checkInTime = null;
  writeDB(db);
  res.json(attendee);
});

// Update a volunteer task's status
router.patch('/tasks/:id', (req, res) => {
  const { status } = req.body || {};
  const allowed = ['Unassigned', 'Assigned', 'Completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
  }
  const db = readDB();
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = status;
  writeDB(db);
  res.json(task);
});

// Post a new announcement
router.post('/announcements', (req, res) => {
  const { message, sender } = req.body || {};
  if (!message || !sender) {
    return res.status(400).json({ error: 'message and sender are required' });
  }
  const db = readDB();
  const announcement = {
    id: `ann${Date.now()}`,
    message: String(message),
    sender: String(sender),
    timestamp: new Date().toISOString(),
  };
  db.announcements.unshift(announcement);
  writeDB(db);
  res.status(201).json(announcement);
});

// Simple health check for hosting platforms / uptime monitors
router.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', router);

// In production, serve the built frontend (npm run build -> dist/) and
// fall back to index.html for client-side routing.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Community Event OS server listening on port ${PORT}`);
});
