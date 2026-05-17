import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

/* global process */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = 5000;

const BASE44_APP_ID = process.env.BASE44_APP_ID || '69c84f61d5543b54fe26e1e5';
const BASE_FN = `https://api.base44.com/api/apps/${BASE44_APP_ID}/functions`;

app.use(cors());
app.use(express.json());

// ─── Proxy helper ─────────────────────────────────────────────────────────────
async function callFunction(fnName, body = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_FN}/${fnName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  // downloadVpnConfig returns raw text
  if (fnName === 'downloadVpnConfig') {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `Request failed (${res.status})`);
    }
    return { __raw: true, text: await res.text() };
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data;
}

function getToken(req) {
  return req.headers['authorization']?.replace('Bearer ', '') || null;
}

// ─── POST /login ──────────────────────────────────────────────────────────────
app.post('/login', async (req, res) => {
  const { email, password, device_id, device_name, device_type } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  try {
    const data = await callFunction('authLogin', { email, password, device_id, device_name, device_type });

    if (!data.success) {
      return res.status(401).json({ error: data.message || 'Invalid email or password.' });
    }

    console.log(`[login] ${email} → authLogin success`);
    res.json({
      token: data.token,
      email: data.user?.email || email,
      name: data.user?.name || email.split('@')[0],
      plan: data.subscription?.plan || null,
      subscription: data.subscription || null,
      device: data.device || null,
      subscriptionActive: data.subscriptionActive,
    });
  } catch (err) {
    console.error('[login] error:', err.message);
    res.status(500).json({ error: err.message || 'Login failed. Please try again.' });
  }
});

// ─── GET /servers ─────────────────────────────────────────────────────────────
app.get('/servers', async (req, res) => {
  const token = getToken(req);
  const { device_id } = req.query;

  try {
    const data = await callFunction('getVpnServersForUser', { device_id }, token);
    res.json({ servers: data.servers || [] });
  } catch (err) {
    console.error('[servers] error:', err.message);
    // Fallback static list
    res.json({ servers: [
      { id: 'us-ny',  region: 'New York',     city: 'New York',     country: 'US', flag: '🇺🇸' },
      { id: 'gb-lon', region: 'London',        city: 'London',       country: 'GB', flag: '🇬🇧' },
      { id: 'de-fra', region: 'Frankfurt',     city: 'Frankfurt',    country: 'DE', flag: '🇩🇪' },
      { id: 'nl-ams', region: 'Amsterdam',     city: 'Amsterdam',    country: 'NL', flag: '🇳🇱' },
      { id: 'sg-sgp', region: 'Singapore',     city: 'Singapore',    country: 'SG', flag: '🇸🇬' },
      { id: 'jp-tyo', region: 'Tokyo',         city: 'Tokyo',        country: 'JP', flag: '🇯🇵' },
      { id: 'au-syd', region: 'Sydney',        city: 'Sydney',       country: 'AU', flag: '🇦🇺' },
      { id: 'ca-tor', region: 'Toronto',       city: 'Toronto',      country: 'CA', flag: '🇨🇦' },
      { id: 'fr-par', region: 'Paris',         city: 'Paris',        country: 'FR', flag: '🇫🇷' },
    ]});
  }
});

// ─── POST /download-config ────────────────────────────────────────────────────
app.post('/download-config', async (req, res) => {
  const token = getToken(req);
  const { device_id, server_id, proto } = req.body;

  try {
    const result = await callFunction('downloadVpnConfig', { device_id, server_id, platform: 'windows', proto: proto || 'udp' }, token);
    if (result.__raw) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(result.text);
    }
    res.json(result);
  } catch (err) {
    console.error('[download-config] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /session-start ──────────────────────────────────────────────────────
app.post('/session-start', async (req, res) => {
  const token = getToken(req);
  const { device_id, server_id } = req.body;

  try {
    const data = await callFunction('connectSessionStart', { device_id, server_id }, token);
    res.json(data);
  } catch (err) {
    console.error('[session-start] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /session-end ────────────────────────────────────────────────────────
app.post('/session-end', async (req, res) => {
  const token = getToken(req);
  const { device_id, server_id, bytes_sent, bytes_received, duration_seconds } = req.body;

  try {
    const data = await callFunction('connectSessionEnd', { device_id, server_id, bytes_sent, bytes_received, duration_seconds }, token);
    res.json(data);
  } catch (err) {
    console.error('[session-end] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /heartbeat ──────────────────────────────────────────────────────────
app.post('/heartbeat', async (req, res) => {
  const token = getToken(req);
  const { device_id, server_id } = req.body;

  try {
    const data = await callFunction('heartbeatPing', { device_id, server_id }, token);
    res.json(data);
  } catch (err) {
    console.error('[heartbeat] error:', err.message);
    // Don't fail heartbeat on network error — client will keep trying
    res.json({ ok: true });
  }
});

// ─── POST /revoke-device ─────────────────────────────────────────────────────
app.post('/revoke-device', async (req, res) => {
  const token = getToken(req);
  const { device_id } = req.body;

  try {
    const data = await callFunction('revokeDeviceSession', { device_id }, token);
    res.json(data);
  } catch (err) {
    console.error('[revoke-device] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /check-access (legacy compat) ──────────────────────────────────────
app.post('/check-access', async (req, res) => {
  const token = getToken(req);
  try {
    const data = await callFunction('validateSubscription', {}, token);
    res.json({ access: data.subscriptionActive || data.active || false, plan: data.plan || null });
  } catch {
    res.json({ access: true, plan: null });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ VoxVPN V1.5 backend running at http://localhost:${PORT}`);
  console.log(`   Proxying to Base44 App: ${BASE44_APP_ID}\n`);
});