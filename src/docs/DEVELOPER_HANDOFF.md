# VoxShield Desktop Installer — Developer Handoff

> **Last updated:** July 15, 2026
> **App ID:** `69c84f61d5543b54fe26e1e5`
> **API Base:** `https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions`
> **Production URL:** https://voxvpn.net

---

## TABLE OF CONTENTS
1. [What Already Exists](#1-what-already-exists)
2. [Source Files to Reference](#2-source-files-to-reference)
3. [API Endpoints (All Backend Functions)](#3-api-endpoints)
4. [Database Entities (Schemas)](#4-database-entities)
5. [Executive Features to Build](#5-executive-features-to-build)
6. [Build & Package Instructions](#6-build--package-instructions)
7. [Silent Deployment](#7-silent-deployment)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. WHAT ALREADY EXISTS

The Electron desktop app is **already functional** with:
- ✅ Login screen (email + password → `authLogin`)
- ✅ Signup screen (→ `emailSignup`)
- ✅ VPN dashboard (connect/disconnect, server selector)
- ✅ System tray integration (minimize to tray, quick connect)
- ✅ OpenVPN CLI bundling + TAP driver
- ✅ OS-encrypted token storage (Windows DPAPI)
- ✅ Heartbeat subscription enforcement (auto-disconnect on expiry)
- ✅ DNS filter config fetching from backend
- ✅ Security event logging to backend
- ✅ Cross-platform build config (Windows NSIS, macOS DMG, Linux AppImage)

**Current version:** `3.0.0` (see `src/electron/package.json`)

---

## 2. SOURCE FILES TO REFERENCE

All files live in the Base44 workspace. Key ones:

### Electron App (`src/electron/`)
| File | Purpose |
|------|---------|
| `main.js` | Electron main process — window, tray, VPN, DNS, token storage |
| `preload.js` | IPC bridge between main and renderer |
| `api.js` | HTTP client → Base44 backend functions (ALL endpoints) |
| `AuthContext.jsx` | Auth state management (login/logout/session) |
| `App.jsx` | React router (Login ↔ Dashboard) |
| `Login.jsx` | Login screen with device registration |
| `Signup.jsx` | Signup screen (full_name, email, password) |
| `Dashboard.jsx` | VPN dashboard (server list, connect, stats) |
| `package.json` | Electron + electron-builder config |

### Installer Scripts (`src/installer/voxshield/`)
| File | Purpose |
|------|---------|
| `VoxShield.iss` | Inno Setup script for Windows .exe |
| `build.bat` | Windows build script |
| `build-macos.sh` | macOS build script |
| `build-linux.sh` | Linux build script |
| `voxshield-build.yml` | GitHub Actions CI/CD workflow |
| `assets/entitlements.mac.plist` | macOS code signing entitlements |

### Backend Functions (`base44/functions/`)
| Function | Purpose |
|----------|---------|
| `authLogin` | Login + device registration |
| `emailSignup` | Account creation |
| `validateSubscription` | Check active/trial status |
| `heartbeatPing` | Keep-alive + enforcement |
| `getVpnServersForUser` | Server list for user's device |
| `recommendServer` | Auto-pick best server |
| `downloadVpnConfig` | Generate .ovpn config (raw bytes) |
| `connectSessionStart` | Start VPN session tracking |
| `connectSessionEnd` | End session (bandwidth/duration) |
| `revokeDeviceSession` | Admin remote revoke |
| `getTeamData` | Team members, subscriptions, DNS config |
| `inviteTeamMember` | Invite user to business team |
| `removeTeamMember` | Remove from team |
| `updateDnsFilter` | Update DNS filtering policy |
| `businessSignup` | Business account creation |
| `logSecurityEvent` | Report security events |
| `latestVersion` | Version check for auto-update |
| `runSpeedTest` | Server speed test |
| `forgotPassword` | Password reset |

### Spec Document
- `src/docs/BUSINESS_INSTALLER_SPEC.md` — Full architecture spec with code snippets

---

## 3. API ENDPOINTS

### Base URL
```
https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions
```

### Auth Pattern
All authenticated calls send `Authorization: Bearer <token>` header. Token is returned by `authLogin`.

### Key Endpoints (POST requests)

#### Login + Device Registration
```http
POST /authLogin
Body: { email, password, device_id, device_name, device_type }
Returns: { token, user, subscription, vpn_servers }
```

#### Validate Subscription (heartbeat)
```http
POST /validateSubscription
Headers: Authorization: Bearer <token>
Returns: { status: "active"|"trial"|"expired", plan, renewal_date, max_devices }
```

#### Get VPN Servers
```http
POST /getVpnServersForUser
Headers: Authorization: Bearer <token>
Body: { device_id }
Returns: { servers: [{ id, region, country, city, ip_address, port, proto, status, current_load }] }
```

#### Download VPN Config (.ovpn)
```http
POST /downloadVpnConfig
Headers: Authorization: Bearer <token>
Body: { device_id, server_id, platform: "windows", proto: "udp" }
Returns: RAW TEXT (.ovpn file content — NOT JSON)
```

#### Get Team Data (business)
```http
POST /getTeamData
Headers: Authorization: Bearer <token>
Returns: { client, teamMembers, subscriptions, devices, securityLogs, dnsLogs, stats }
```

#### Log Security Event
```http
POST /logSecurityEvent
Headers: Authorization: Bearer <token>
Body: { event_type, message, severity, device_name }
Returns: { success: true }
```

#### Heartbeat (every 60s while connected)
```http
POST /heartbeatPing
Headers: Authorization: Bearer <token>
Body: { device_id, server_id }
Returns: { status: "ok", subscription_active: true }
```

#### Session Start/End
```http
POST /connectSessionStart
Headers: Authorization: Bearer <token>
Body: { device_id, server_id }

POST /connectSessionEnd
Headers: Authorization: Bearer <token>
Body: { device_id, server_id, bytes_sent, bytes_received, duration_seconds }
```

### Existing API Client
The file `src/electron/api.js` already wraps ALL of these. The developer just imports and uses:
```javascript
import { api } from './api';

const res = await api.login(email, password, deviceId, hostname, 'windows');
const sub = await api.validateSubscription(res.token);
const servers = await api.getServers(res.token, deviceId);
const config = await api.downloadConfig(res.token, deviceId, serverId, 'udp');
```

---

## 4. DATABASE ENTITIES

### Client (Business Team)
```
- id, name, contact_email, contact_phone
- vpn_plan: "basic"|"standard"|"premium"|"enterprise"
- max_users, max_devices
- status: "active"|"suspended"|"trial"
- domains: ["acme.com", "internal.acme.com"]
- dns_filter_config: {
    block_malware, block_phishing, block_adult, block_gambling,
    block_social_media, block_streaming,
    custom_blocklist: [], custom_allowlist: []
  }
- agency_id (null for direct business signups)
- risk_score (0-100)
- stripe_subscription_id
```

### VPNSubscription
```
- user_email, plan, status, billing_cycle, price
- start_date, renewal_date, max_devices
- stripe_subscription_id
- status: "active"|"trial"|"pending_payment"|"expired"|"cancelled"|"paused"
```

### LinkedDevice
```
- subscription_id, device_name, device_type, device_id
- vpn_profile_key (OpenVPN private key PEM)
- client_cert (OpenVPN certificate PEM)
- status: "active"|"inactive"
- last_connected, ip_address
```

### SecurityLog (for antivirus/threat reporting)
```
- client_id, agency_id, user_email, device_name
- event_type: "vpn_connect"|"vpn_disconnect"|"dns_block"|"device_register"|
              "device_remove"|"login"|"login_failed"|"threat_detected"|
              "policy_change"|"subscription_change"
- severity: "info"|"warning"|"critical"
- message, ip_address, timestamp
```

### DNSFilterLog
```
- client_id, agency_id, user_email, device_name
- domain, category, blocked (bool)
- ip_address, timestamp
- category: "malware"|"phishing"|"adult"|"gambling"|"social_media"|"streaming"|"custom"|"allowed"
```

---

## 5. EXECUTIVE FEATURES TO BUILD

### PRIORITY 1: Auto-Quarantine (ClamAV + VPN isolation)

**What it does:** When ClamAV detects malware, the agent instantly:
1. Disconnects the VPN tunnel
2. Moves the infected file to quarantine
3. Sends a `threat_detected` event to `SecurityLog`
4. Triggers a Slack alert via the backend automation

**Files to create:**
- `src/electron/antivirus.js` — ClamAV wrapper (real-time scan, quarantine, full scan)

**Code reference:** See `src/docs/BUSINESS_INSTALLER_SPEC.md` section 1 for full implementation.

**ClamAV bundling:**
- Download: https://www.clamav.net/downloads
- Place binaries in `src/installer/voxshield/assets/clamav/`
- Add to `src/electron/package.json` → `build.extraResources`:
  ```json
  {
    "from": "../installer/voxshield/assets/clamav",
    "to": "clamav"
  }
  ```
- Run `freshclam.exe` on startup to update signatures

**Key function to call on threat detection:**
```javascript
await api.logSecurityEvent(token, 'threat_detected', `Malware: ${filename}`, 'critical', hostname);
```

---

### PRIORITY 2: Team Auto-Linking (Silent Deploy)

**What it does:** IT admin runs installer with flags → device auto-registers to the business team.

**Silent install command:**
```batch
VoxShield-Business-Setup-3.0.0.exe /SILENT /TEAM_TOKEN=CLIENT_ENTITY_ID /NORESTART
```

**Electron main.js — read token on launch:**
```javascript
async function autoRegisterTeam() {
  const teamToken = process.argv.find(a => a.startsWith('/TEAM_TOKEN='))?.split('=')[1];
  if (!teamToken) return;

  // teamToken = Client entity ID
  const clientId = teamToken;
  const deviceId = generateDeviceId(); // hardware hash

  const res = await api.login(storedEmail, storedPassword, deviceId, os.hostname(), 'windows');

  // Fetch team DNS policy
  const teamData = await fetch(`${BASE}/getTeamData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${res.token}` },
  }).then(r => r.json());

  applyDnsFiltering(teamData.client.dns_filter_config);
  antivirus.startRealtimeScan();
}
```

**Inno Setup changes** (`src/installer/voxshield/VoxShield.iss`):
```iss
[Run]
Filename: "{app}\VoxShield.exe"; Parameters: "/TEAM_TOKEN={param:TEAM_TOKEN} /AUTO_LOGIN"; \
  Flags: nowait postinstall skipifsilent
```

---

### PRIORITY 3: DNS Filtering (Network Level)

**Windows — Hosts file approach:**
```javascript
function applyDnsFiltering(config) {
  const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  const blockList = buildBlockList(config); // categories + custom domains

  let hosts = fs.readFileSync(hostsPath, 'utf8');
  // Remove old VoxShield entries
  hosts = hosts.replace(/# VoxShield-Block-Start[\s\S]*?# VoxShield-Block-End/g, '');
  hosts += `\n# VoxShield-Block-Start\n`;
  blockList.forEach(domain => {
    hosts += `0.0.0.0 ${domain}\n`;
  });
  hosts += `# VoxShield-Block-End\n`;

  // Requires admin — installer runs as admin
  fs.writeFileSync(hostsPath, hosts);
}
```

**Alternative (more robust):** DNS over HTTPS — route all DNS through VoxDNS resolver with server-side filtering.

**DNS config is fetched from `getTeamData` response:**
```javascript
const teamData = await api.getTeamData(token);
const dnsConfig = teamData.client.dns_filter_config;
// { block_malware: true, block_phishing: true, block_adult: false, ... }
```

---

### PRIORITY 4: Remote Device Wipe

**What it does:** Admin clicks "Wipe" in dashboard → backend calls → device receives command on next heartbeat → purges credentials + disconnects.

**Backend already supports:** `revokeDeviceSession` function revokes the device's VPN access.

**Desktop needs to:**
1. On each `heartbeatPing` response, check for `wipe_command: true`
2. If received: delete stored token, delete .ovpn configs, clear OpenVPN cache
3. Show "Device remotely wiped by administrator" message

```javascript
// In heartbeat handler
const hb = await api.heartbeat(token, deviceId, serverId);
if (hb.wipe_command) {
  await purgeCredentials();
  await disconnectVpn();
  showWipeNotification();
}
```

---

### PRIORITY 5: White-Label Branding

**What it does:** Installer and tray icon show the agency's logo/colors instead of VoxVPN.

**Implementation:**
1. Fetch branding from `getTeamData` → `client.agency_id` → Agency entity
2. Agency entity has: `logo_url`, `brand_color`, `white_label_enabled`
3. On first launch, download `logo_url` and cache locally
4. Replace tray icon, window title, and splash screen with agency branding

```javascript
const teamData = await api.getTeamData(token);
if (teamData.client?.agency?.white_label_enabled) {
  const logo = teamData.client.agency.logo_url;
  const color = teamData.client.agency.brand_color;
  applyBranding(logo, color);
}
```

---

### PRIORITY 6: Compliance Audit Exports

**What it does:** Monthly PDF report of VPN usage, threats blocked, policy enforcement.

**Backend side (already can build):** `SecurityReport` entity stores monthly reports.

**Desktop needs to:**
1. Track: VPN connect/disconnect times, bandwidth used, threats blocked, DNS blocks
2. Send aggregated stats via `heartbeatPing` or a new `reportDeviceStats` call
3. Backend generates PDF from aggregated data

---

## 6. BUILD & PACKAGE INSTRUCTIONS

### Prerequisites
- Node.js 18+
- npm install in `src/electron/`
- For Windows builds: Windows 10/11 or cross-compile
- For macOS builds: macOS + Xcode command line tools
- For Linux builds: Linux with dpkg/rpm

### Build Commands
```bash
cd src/electron
npm install

# Build Vite React frontend
npm run build

# Package for current platform
npm run build:win    # → .exe (NSIS installer)
npm run build:mac    # → .dmg
npm run build:linux  # → .AppImage
```

### Output Location
```
src/installer/voxshield/output/
  ├── VoxShield Setup 3.0.0.exe    (Windows)
  ├── VoxShield-3.0.0.dmg          (macOS)
  └── VoxShield-3.0.0.AppImage     (Linux)
```

### electron-builder Config
Already configured in `src/electron/package.json` → `build` section:
- App ID: `net.voxvpn.shield`
- Product name: `VoxShield`
- Windows: NSIS installer, x64, requires admin
- macOS: DMG, x64 + arm64, hardened runtime
- Linux: AppImage, x64

### ClamAV Bundling
Add to `src/electron/package.json` → `build.extraResources`:
```json
{
  "from": "../installer/voxshield/assets/clamav",
  "to": "clamav"
}
```

---

## 7. SILENT DEPLOYMENT

### Windows (PDQ Deploy, SCCM, Intune, GPO)
```batch
VoxShield-Business-Setup-3.0.0.exe /SILENT /TEAM_TOKEN=CLIENT_ENTITY_ID /NORESTART
```

**Pre-config:** Embed credentials via environment variables or a config file:
```json
{
  "email": "it@acme.com",
  "password": "encrypted_string_here",
  "team_token": "CLIENT_ENTITY_ID"
}
```

### macOS (Jamf, MDM)
```bash
# Install .dmg silently
hdiutil attach VoxShield-3.0.0.dmg
cp -R "/Volumes/VoxShield/VoxShield.app" /Applications/
hdiutil detach "/Volumes/VoxShield"
# Launch with team token
open -a VoxShield --args --team-token=CLIENT_ENTITY_ID
```

### Linux
```bash
chmod +x VoxShield-3.0.0.AppImage
./VoxShield-3.0.0.AppImage --team-token=CLIENT_ENTITY_ID
```

---

## 8. TESTING CHECKLIST

### Core VPN
- [ ] Login with valid credentials → token stored, device registered
- [ ] Login with expired subscription → blocked with message
- [ ] Server list loads with correct regions
- [ ] Download .ovpn config → OpenVPN connects
- [ ] Heartbeat sends every 60s while connected
- [ ] Disconnect → session end logged with bandwidth
- [ ] Token persists across app restarts (DPAPI encrypted)
- [ ] Kill switch activates on VPN disconnect

### Antivirus (after ClamAV integration)
- [ ] Real-time scan detects EICAR test file
- [ ] Infected file moved to quarantine folder
- [ ] Threat logged to `SecurityLog` entity
- [ ] Full system scan completes without crash
- [ ] freshclam updates signatures on startup

### DNS Filtering
- [ ] Hosts file updated with blocklist on VPN connect
- [ ] Blocked domains redirect to 0.0.0.0
- [ ] Custom allowlist overrides blocklist
- [ ] Hosts file cleaned on VPN disconnect

### Team Auto-Linking
- [ ] Silent install with `/TEAM_TOKEN` registers device
- [ ] DNS policy applied automatically after registration
- [ ] Device appears in admin dashboard
- [ ] Non-silent install shows normal login flow

### Remote Wipe
- [ ] Admin clicks "Wipe" → device receives command on next heartbeat
- [ ] Credentials purged, VPN disconnects
- [ ] User sees wipe notification

---

## CONTACT

- **Base44 App ID:** `69c84f61d5543b54fe26e1e5`
- **API Base:** `https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions`
- **Production site:** https://voxvpn.net
- **Spec doc:** `src/docs/BUSINESS_INSTALLER_SPEC.md`
- **API client:** `src/electron/api.js`
- **Build config:** `src/electron/package.json`

For backend function changes or new API endpoints, the Base44 platform owner handles those — the developer only needs to call existing endpoints.