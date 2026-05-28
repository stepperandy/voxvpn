/**
 * VoxVPN Electron — Direct HTTP API client
 * All requests go to Base44 backend functions via production endpoints.
 */

const BASE = 'https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions';

async function request(fn, body = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  // downloadVpnConfig returns raw .ovpn bytes — handle separately
  if (fn === 'downloadVpnConfig') {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `Request failed (${res.status})`);
    }
    return res.text();
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth
  login: (email, password, device_id, device_name, device_type = 'windows') =>
    request('authLogin', { email, password, device_id, device_name, device_type }),

  // Subscription
  validateSubscription: (token) =>
    request('validateSubscription', {}, token),

  // Servers
  getServers: (token, device_id) =>
    request('getVpnServersForUser', { device_id }, token),

  recommendServer: (token, device_id) =>
    request('recommendServer', { device_id }, token),

  // Config
  downloadConfig: (token, device_id, server_id, proto = 'udp') =>
    request('downloadVpnConfig', { device_id, server_id, platform: 'windows', proto }, token),

  // Session lifecycle
  sessionStart: (token, device_id, server_id) =>
    request('connectSessionStart', { device_id, server_id }, token),

  sessionEnd: (token, device_id, server_id, bytes_sent = 0, bytes_received = 0, duration_seconds = 0) =>
    request('connectSessionEnd', { device_id, server_id, bytes_sent, bytes_received, duration_seconds }, token),

  heartbeat: (token, device_id, server_id) =>
    request('heartbeatPing', { device_id, server_id }, token),

  // Device
  revokeDevice: (token, device_id) =>
    request('revokeDeviceSession', { device_id }, token),

  // Password
  forgotPassword: (email) =>
    request('forgotPassword', { email }),

  // Version check — hosted at voxvpn.net/downloads/
  latestVersion: () =>
    request('latestVersion', { platform: 'Windows' }),

  // Speed test
  runSpeedTest: (token, device_id) =>
    request('runSpeedTest', { device_id }, token),

  // Direct installer URL (fallback if latestVersion has no download_url)
  INSTALLER_URL: 'https://github.com/stepperandy/voxvpn/releases/download/v2.0.0/VoxVPN-Setup-v2.0.exe',
};