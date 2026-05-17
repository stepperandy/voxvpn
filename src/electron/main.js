/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

const APP_VERSION = '2.0.0';
const BASE44_APP_ID = '69c84f61d5543b54fe26e1e5';
const BASE_FN = `https://api.base44.com/api/apps/${BASE44_APP_ID}/functions`;

let mainWindow = null;
let openvpnProcess = null;

// ─── Secure token store (encrypted via OS keychain) ───────────────────────────
const TOKEN_FILE = path.join(app.getPath('userData'), 'voxvpn.enc');

function saveToken(token) {
  if (!token) return;
  if (safeStorage.isEncryptionAvailable()) {
    const enc = safeStorage.encryptString(token);
    fs.writeFileSync(TOKEN_FILE, enc);
  } else {
    fs.writeFileSync(TOKEN_FILE, token, 'utf8');
  }
}

function loadToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  const raw = fs.readFileSync(TOKEN_FILE);
  if (safeStorage.isEncryptionAvailable()) {
    try { return safeStorage.decryptString(raw); } catch { return null; }
  }
  return raw.toString('utf8');
}

function clearToken() {
  if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
}

// ─── Window ───────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 620,
    resizable: false,
    frame: false,
    backgroundColor: '#080c18',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    stopVpn();
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopVpn();
  app.quit();
});

// ─── Window controls ──────────────────────────────────────────────────────────
ipcMain.on('win-minimize', () => mainWindow?.minimize());
ipcMain.on('win-close', () => { stopVpn(); mainWindow?.close(); });

// ─── Secure token IPC ─────────────────────────────────────────────────────────
ipcMain.handle('token-save',  (_e, token) => { saveToken(token); return true; });
ipcMain.handle('token-load',  ()           => loadToken());
ipcMain.handle('token-clear', ()           => { clearToken(); return true; });

// ─── Version / update check ───────────────────────────────────────────────────
ipcMain.handle('check-update', async () => {
  try {
    const res = await fetch(`${BASE_FN}/latestVersion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'Windows' }),
    });
    const data = await res.json();
    const latest = data?.version || data?.latest_version || null;
    if (!latest) return { hasUpdate: false, current: APP_VERSION };
    const hasUpdate = latest !== APP_VERSION;
    return { hasUpdate, current: APP_VERSION, latest, downloadUrl: data?.download_url || null };
  } catch {
    return { hasUpdate: false, current: APP_VERSION };
  }
});

// ─── App version ──────────────────────────────────────────────────────────────
ipcMain.handle('get-version', () => APP_VERSION);

// ─── Find openvpn.exe ─────────────────────────────────────────────────────────
function findOpenvpn() {
  const candidates = [
    'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe',
    'C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe',
    path.join(process.resourcesPath || '', 'openvpn', 'openvpn.exe'),
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

// ─── VPN: Connect ─────────────────────────────────────────────────────────────
ipcMain.handle('vpn-connect', async (_e, { ovpnContent }) => {
  stopVpn();

  const bin = findOpenvpn();
  if (!bin) return { ok: false, error: 'OpenVPN not found. Please reinstall VoxVPN.' };

  const tmpFile = path.join(os.tmpdir(), 'voxvpn-active.ovpn');
  const logFile = path.join(os.tmpdir(), 'voxvpn.log');
  fs.writeFileSync(tmpFile, ovpnContent, 'utf8');

  return new Promise((resolve) => {
    openvpnProcess = spawn(bin, ['--config', tmpFile, '--log', logFile], {
      windowsHide: true,
      detached: false,
    });

    let resolved = false;

    const onData = (data) => {
      const line = data.toString();
      mainWindow?.webContents.send('vpn-log', line);

      if (!resolved && line.includes('Initialization Sequence Completed')) {
        resolved = true;
        mainWindow?.webContents.send('vpn-status', 'connected');
        resolve({ ok: true });
      }

      if (!resolved && (line.includes('AUTH_FAILED') || line.includes('TLS Error') || line.includes('SIGTERM'))) {
        resolved = true;
        stopVpn();
        resolve({ ok: false, error: line.trim() });
      }
    };

    openvpnProcess.stdout.on('data', onData);
    openvpnProcess.stderr.on('data', onData);

    openvpnProcess.on('exit', () => {
      openvpnProcess = null;
      fs.unlink(tmpFile, () => {});
      mainWindow?.webContents.send('vpn-status', 'idle');
      if (!resolved) {
        resolved = true;
        resolve({ ok: false, error: 'OpenVPN exited unexpectedly. Check log.' });
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ ok: false, error: 'Connection timed out after 30 seconds.' });
      }
    }, 30000);
  });
});

// ─── VPN: Disconnect ──────────────────────────────────────────────────────────
ipcMain.handle('vpn-disconnect', () => {
  stopVpn();
  return { ok: true };
});

// ─── VPN: Status ──────────────────────────────────────────────────────────────
ipcMain.handle('vpn-status', () => ({
  connected: openvpnProcess !== null,
}));

// ─── Read last log lines ───────────────────────────────────────────────────────
ipcMain.handle('vpn-get-log', () => {
  const logFile = path.join(os.tmpdir(), 'voxvpn.log');
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    return content.trim().split('\n').slice(-20).join('\n');
  } catch {
    return 'No log available.';
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function stopVpn() {
  if (openvpnProcess) {
    openvpnProcess.kill();
    openvpnProcess = null;
  }
  exec('taskkill /F /IM openvpn.exe', () => {});
}