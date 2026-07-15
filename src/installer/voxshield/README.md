# VoxShield Business Security — Desktop Installer

Complete cross-platform build system for the VoxShield desktop security agent.
The agent uses the **same login flow and backend** as voxvpn.net — one account works everywhere.

## Architecture

```
User installs VoxShield → Login screen (shared auth)
  ├── New user? → Signup → "Buy a plan at voxvpn.net/pricing" → Login
  └── Existing user? → Login with email + password
      → Subscription validated (active/trial required)
      → Server list fetched → Connect to VPN
      → DNS filtering, kill switch, auto-start, tray
```

### Shared Backend (Base44 App ID: `69c84f61d5543b54fe26e1e5`)

| Function | Purpose |
|----------|---------|
| `authLogin` | Login with email/password + device registration |
| `emailSignup` | Create account (no auto-login — must buy plan first) |
| `validateSubscription` | Check active/trial status, enforce access |
| `getVpnServersForUser` | Fetch available servers for the user's plan |
| `downloadVpnConfig` | Download .ovpn config for a specific server |
| `connectSessionStart` / `connectSessionEnd` | Session lifecycle tracking |
| `heartbeatPing` | Keep-alive + server-side disconnect enforcement |
| `recommendServer` | Auto-select fastest server |
| `forgotPassword` | Password reset email |
| `latestVersion` | Update check |

### Electron App Files

| File | Purpose |
|------|---------|
| `src/electron/main.js` | Main process: window, tray, VPN, DNS filtering, token storage, auto-start |
| `src/electron/preload.js` | IPC bridge (context-isolated) |
| `src/electron/api.js` | HTTP client → Base44 backend functions |
| `src/electron/AuthContext.jsx` | Auth state (localStorage + OS keychain) |
| `src/electron/Login.jsx` | Login screen with device registration + error states |
| `src/electron/Signup.jsx` | Signup screen → redirects to pricing page |
| `src/electron/Dashboard.jsx` | VPN connect/disconnect, servers, DNS, kill switch, speed test |
| `src/electron/App.jsx` | Router (Login ↔ Dashboard) |
| `src/electron/package.json` | Electron + electron-builder config |

---

## Prerequisites

### All Platforms
1. **Node.js 20+** — https://nodejs.org/
2. **npm** (comes with Node.js)

### Windows (additional)
3. **Inno Setup 6** — https://jrsoftware.org/isinfo.php (for .exe installer)
4. **OpenVPN** (bundled or pre-installed at `C:\Program Files\OpenVPN\bin\openvpn.exe`)

### macOS (additional)
3. **Xcode Command Line Tools** — `xcode-select --install`
4. **OpenVPN** — `brew install openvpn` (or bundled in Resources)

### Linux (additional)
3. **OpenVPN** — `sudo apt install openvpn` (Debian/Ubuntu) or distro equivalent
4. **libappindicator** (for tray) — `sudo apt install libappindicator3-1`

---

## Build Steps

### Windows

```bat
:: One-click:
cd src\installer\voxshield
build.bat

:: Or manual:
cd src\electron
npm install
npm run build:win
:: Then compile Inno Setup:
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" ..\installer\voxshield\VoxShield.iss
```

**Output**: `src/installer/voxshield/output/VoxShield-Setup-1.0.0.exe`

### macOS

```bash
chmod +x src/installer/voxshield/build-macos.sh
./src/installer/voxshield/build-macos.sh
```

**Output**: `src/installer/windows/output/VoxShield-*.dmg`

### Linux

```bash
chmod +x src/installer/voxshield/build-linux.sh
./src/installer/voxshield/build-linux.sh
```

**Output**: `src/installer/windows/output/VoxShield-*.AppImage`

### macOS & Linux (GitHub Actions)

The workflow builds **macOS (.dmg)** and **Linux (.AppImage)** installers.

**Setup (one-time):**
1. Copy `src/installer/voxshield/voxshield-build.yml` to `.github/workflows/voxshield-build.yml`
2. (Optional) Add `SLACK_WEBHOOK_URL` secret for failure notifications
3. (Optional) Add `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` secrets for macOS code signing

**Trigger a release:**
```bash
git tag shield-v3.0.1
git push origin shield-v3.0.1
```

This builds both platforms in parallel and creates a GitHub Release with:
- `VoxShield-*.dmg` (macOS, x64 + arm64)
- `VoxShield-*.AppImage` (Linux, x64)

You can also run manually from the Actions tab → "Run workflow".

---

## What the Installer Does

### Windows (.exe — Inno Setup)
- Installs to `Program Files\VoxShield`
- Start Menu + optional Desktop shortcuts
- Optional auto-start on Windows login
- Requires admin privileges (for DNS filtering / hosts file)
- Kills running VoxShield before install/uninstall
- Windows 10 1809+ minimum

### macOS (.dmg)
- Drag-to-Applications installer
- App bundle with embedded OpenVPN (if configured)
- macOS Keychain token storage via `safeStorage`

### Linux (.AppImage)
- Portable single-file AppImage
- No installation required — `chmod +x` and run
- Token stored in encrypted user config

---

## Login & Onboarding Flow

1. **First launch** → Login screen appears
2. **New users** click "Get a plan at voxvpn.net" → browser opens to `/pricing`
3. **After purchase** → return to app, sign in with email + password
4. **Auth flow**:
   - Device ID generated (hardware-based hash, stored in localStorage)
   - Device name auto-detected (e.g., "Windows PC (Win32)")
   - `authLogin` called with `{ email, password, device_id, device_name, device_type }`
   - Token saved to OS keychain (Windows DPAPI / macOS Keychain)
   - If subscription expired → "Renew at voxvpn.net" link
   - If device limit exceeded → "Manage devices at voxvpn.net" link
5. **Dashboard** → server list loads, user connects, heartbeat starts

### Signup Flow (In-App)
1. User enters full name, email, password (8+ chars, upper+lower+number)
2. `emailSignup` creates the account
3. Success screen: "Account created! Choose a plan at voxvpn.net/pricing"
4. User buys plan in browser → returns to app → signs in

---

## Customization

### Change App Name / Version
Edit `src/electron/package.json`:
```json
{
  "name": "voxshield-agent",
  "version": "1.0.0",
  "build": {
    "productName": "VoxShield Business Security",
    "appId": "net.voxvpn.shield"
  }
}
```

Edit `src/installer/voxshield/VoxShield.iss` for Windows installer metadata.

### Change Backend
Edit `src/electron/api.js`:
```js
const BASE = 'https://api.base44.com/api/apps/YOUR_APP_ID/functions';
```

### Bundle OpenVPN (Windows)
Add to `src/electron/package.json` → `build.extraResources`:
```json
{
  "from": "installer/assets/openvpn",
  "to": "openvpn"
}
```
The app auto-detects OpenVPN at `resources/openvpn/openvpn.exe`.

### Add App Icon
Place icon files at:
- Windows: `src/electron/installer/windows/assets/icon.ico`
- macOS: `src/electron/installer/windows/assets/icon.icns`
- Linux: `src/electron/installer/windows/assets/icon.png` (512×512)

---

## CI/CD Secrets (GitHub Actions)

| Secret | Purpose |
|--------|---------|
| `SLACK_WEBHOOK_URL` | Slack notification on build failure |
| `APPLE_ID` | macOS code signing (optional) |
| `APPLE_PASSWORD` | macOS code signing (optional) |
| `APPLE_TEAM_ID` | macOS code signing (optional) |
| `WIN_SIGNING_CERT` | Windows code signing (optional) |
| `WIN_SIGNING_PASSWORD` | Windows code signing (optional) |

Code signing is optional — builds work unsigned but show OS warnings.