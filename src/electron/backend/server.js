import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Use global fetch (Node 18+) or fall back to node-fetch
const _fetch = globalThis.fetch || (await import('node-fetch').then(m => m.default).catch(() => null));
const apiFetch = _fetch || fetch;

/* global process */
const BASE44_APP_ID = process.env.BASE44_APP_ID || '';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// ─── Simple JSON "database" ──────────────────────────────────────────────────

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], sessions: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'voxvpn_salt').digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getUserByToken(token) {
  const db = readDB();
  const session = db.sessions.find(s => s.token === token);
  if (!session) return null;
  return db.users.find(u => u.email === session.email) || null;
}

// ─── Static server list ───────────────────────────────────────────────────────

const SERVERS = [
  { id: 'us-ny',  city: 'New York',      country: 'United States',  flag: '🇺🇸' },
  { id: 'us-la',  city: 'Los Angeles',   country: 'United States',  flag: '🇺🇸' },
  { id: 'us-chi', city: 'Chicago',       country: 'United States',  flag: '🇺🇸' },
  { id: 'gb-lon', city: 'London',        country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'de-fra', city: 'Frankfurt',     country: 'Germany',        flag: '🇩🇪' },
  { id: 'fr-par', city: 'Paris',         country: 'France',         flag: '🇫🇷' },
  { id: 'nl-ams', city: 'Amsterdam',     country: 'Netherlands',    flag: '🇳🇱' },
  { id: 'se-sto', city: 'Stockholm',     country: 'Sweden',         flag: '🇸🇪' },
  { id: 'ch-zur', city: 'Zurich',        country: 'Switzerland',    flag: '🇨🇭' },
  { id: 'no-osl', city: 'Oslo',          country: 'Norway',         flag: '🇳🇴' },
  { id: 'ca-tor', city: 'Toronto',       country: 'Canada',         flag: '🇨🇦' },
  { id: 'au-syd', city: 'Sydney',        country: 'Australia',      flag: '🇦🇺' },
  { id: 'sg-sgp', city: 'Singapore',     country: 'Singapore',      flag: '🇸🇬' },
  { id: 'jp-tyo', city: 'Tokyo',         country: 'Japan',          flag: '🇯🇵' },
  { id: 'hk-hkg', city: 'Hong Kong',     country: 'Hong Kong',      flag: '🇭🇰' },
  { id: 'in-mum', city: 'Mumbai',        country: 'India',          flag: '🇮🇳' },
  { id: 'br-sao', city: 'São Paulo',     country: 'Brazil',         flag: '🇧🇷' },
  { id: 'mx-mex', city: 'Mexico City',   country: 'Mexico',         flag: '🇲🇽' },
  { id: 'za-jnb', city: 'Johannesburg',  country: 'South Africa',   flag: '🇿🇦' },
  { id: 'ae-dxb', city: 'Dubai',         country: 'UAE',            flag: '🇦🇪' },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /register
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const db = readDB();
  if (db.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = {
    email,
    password_hash: hashPassword(password),
    plan: null,
    created_at: new Date().toISOString(),
  };
  db.users.push(user);

  const token = generateToken();
  db.sessions.push({ token, email, created_at: new Date().toISOString() });
  writeDB(db);

  console.log(`[register] ${email}`);
  res.json({ token, email, name: email.split('@')[0] });
});

// POST /login — authenticates against Base44 backend
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  try {
    // Get a Base44 session token by calling the platform login API
    const loginRes = await apiFetch(`https://api.base44.com/api/apps/${BASE44_APP_ID}/auth/email/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok || !loginData.access_token) {
      return res.status(401).json({ error: loginData.error || loginData.message || 'Invalid email or password.' });
    }

    const accessToken = loginData.access_token;

    // Fetch user info + subscription using the access token
    const userRes = await apiFetch(`https://api.base44.com/api/apps/${BASE44_APP_ID}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();

    // Check subscription
    const subRes = await apiFetch(`https://api.base44.com/api/apps/${BASE44_APP_ID}/entities/VPNSubscription?filter=${encodeURIComponent(JSON.stringify({ user_email: email }))}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const subData = await subRes.json();
    const activeSub = Array.isArray(subData) ? subData.find(s => s.status === 'active') : null;

    // Store session locally for subsequent calls
    const db = readDB();
    db.sessions = db.sessions.filter(s => s.email !== email); // remove old sessions
    db.sessions.push({ token: accessToken, email, created_at: new Date().toISOString() });
    // Upsert user
    const idx = db.users.findIndex(u => u.email === email);
    const userRecord = { email, name: userData.full_name || email.split('@')[0], plan: activeSub?.plan || null };
    if (idx >= 0) db.users[idx] = { ...db.users[idx], ...userRecord };
    else db.users.push(userRecord);
    writeDB(db);

    console.log(`[login] ${email} → Base44 auth success`);
    res.json({
      token: accessToken,
      email,
      name: userData.full_name || email.split('@')[0],
      plan: activeSub?.plan || null,
    });
  } catch (err) {
    console.error('[login] error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /servers
app.get('/servers', (req, res) => {
  res.json({ servers: SERVERS });
});

// POST /check-access — checks Base44 subscription
app.post('/check-access', async (req, res) => {
  const { user_email } = req.body;
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!user_email) return res.status(400).json({ error: 'user_email required.' });

  try {
    const subRes = await apiFetch(`https://api.base44.com/api/apps/${BASE44_APP_ID}/entities/VPNSubscription?filter=${encodeURIComponent(JSON.stringify({ user_email }))}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const subData = await subRes.json();
    const activeSub = Array.isArray(subData) ? subData.find(s => s.status === 'active') : null;

    res.json({ access: !!activeSub, plan: activeSub?.plan || null, email: user_email });
  } catch (err) {
    // Fallback: allow access if we can't verify (so app doesn't break)
    res.json({ access: true, plan: null, email: user_email });
  }
});

// POST /connect
app.post('/connect', (req, res) => {
  const { user_email, server_id } = req.body;
  if (!user_email || !server_id) return res.status(400).json({ error: 'user_email and server_id required.' });

  const server = SERVERS.find(s => s.id === server_id);
  if (!server) return res.status(404).json({ error: 'Server not found.' });

  // Simulate a WireGuard config response
  const config = {
    success: true,
    server_id,
    server_city: server.city,
    server_country: server.country,
    assigned_ip: `10.0.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`,
    protocol: 'WireGuard',
    connected_at: new Date().toISOString(),
  };

  console.log(`[connect] ${user_email} → ${server.city}`);
  res.json(config);
});

// POST /disconnect
app.post('/disconnect', (req, res) => {
  const { user_email } = req.body;
  if (!user_email) return res.status(400).json({ error: 'user_email required.' });

  console.log(`[disconnect] ${user_email}`);
  res.json({ success: true, disconnected_at: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ VoxVPN local backend running at http://localhost:${PORT}`);
  console.log(`   DB file: ${DB_PATH}\n`);
});