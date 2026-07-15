# VoxShield Business Installer — Developer Specification

## Overview

Build a **cross-platform desktop installer** for business clients that bundles:
1. VoxVPN client (OpenVPN tunnel + kill switch)
2. **Vox Antivirus** (real-time malware scanning engine)
3. DNS threat filtering (network-level domain blocking)
4. Team auto-linking (devices auto-register to the business on install)
5. Silent deployment support (for IT admins pushing to multiple machines)

The installer uses the **same Base44 authentication** as the web app — one login works everywhere.

---

## Architecture

```
VoxShield Business Installer
├── Electron Shell (existing src/electron/ — extend this)
│   ├── main.js          → Window, tray, VPN, DNS, token storage
│   ├── preload.js       → IPC bridge
│   ├── api.js           → Base44 backend function calls
│   ├── AuthContext.jsx  → Shared auth (Base44 login)
│   ├── Dashboard.jsx    → VPN connect + antivirus status
│   └── AntivirusPanel.jsx → NEW — Vox Antivirus UI
├── Vox Antivirus Engine
│   ├── ClamAV daemon (bundled) OR custom engine
│   ├── Real-time file scanner (filesystem watcher)
│   ├── Threat quarantine
│   └── Scan reports → Base44 SecurityLog entity
└── Team Deployment
    ├── Silent install flags (/SILENT /TEAM_TOKEN=xxx /AUTO_LOGIN)
    ├── Auto device registration on first boot
    └── Policy enforcement (DNS config from Client entity)
```

---

## 1. Vox Antivirus Engine

### Requirements
- **Real-time scanning**: Monitor filesystem for new/modified files
- **On-demand scanning**: Full system scan button in the UI
- **Malware detection**: Use ClamAV signature database (freshclam updates)
- **Quarantine**: Move infected files to isolated folder
- **Reporting**: Log threats to Base44 `SecurityLog` entity

### Implementation (Windows)
```javascript
// src/electron/antivirus.js (NEW FILE)

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar'); // file watcher

const CLAMAV_PATH = path.join(process.resourcesPath, 'clamav', 'clamdscan.exe');
const QUARANTINE_DIR = path.join(process.env.APPDATA, 'VoxShield', 'quarantine');

// Real-time file watcher
function startRealtimeScan() {
  const watcher = chokidar.watch([
    path.join(process.env.USERPROFILE, 'Downloads'),
    path.join(process.env.USERPROFILE, 'Desktop'),
    path.join(process.env.USERPROFILE, 'Documents'),
  ], { persistent: true, ignoreInitial: true });

  watcher.on('add', (filePath) => scanFile(filePath));
  watcher.on('change', (filePath) => scanFile(filePath));
}

// Scan a single file
async function scanFile(filePath) {
  return new Promise((resolve) => {
    const clam = spawn(CLAMAV_PATH, ['--fdpass', filePath]);
    let output = '';
    clam.stdout.on('data', (d) => output += d.toString());
    clam.on('close', (code) => {
      if (code === 1) {
        // INFECTED — quarantine
        quarantineFile(filePath);
        reportThreat(filePath, output);
      }
      resolve(code === 0);
    });
  });
}

// Move infected file to quarantine
function quarantineFile(filePath) {
  if (!fs.existsSync(QUARANTINE_DIR)) fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
  const dest = path.join(QUARANTINE_DIR, `${Date.now()}_${path.basename(filePath)}`);
  fs.renameSync(filePath, dest);
}

// Report threat to Base44 SecurityLog
async function reportThreat(filePath, details) {
  await api.reportSecurityEvent({
    event_type: 'threat_detected',
    severity: 'critical',
    message: `Malware detected: ${path.basename(filePath)}`,
    description: details,
  });
}

// Full system scan
async function fullScan(onProgress) {
  const dirs = ['C:\\Users', 'C:\\Program Files'];
  // iterate, scan each file, call onProgress
}

module.exports = { startRealtimeScan, scanFile, fullScan, quarantineFile };
```

### ClamAV Bundling
- Download ClamAV for Windows: https://www.clamav.net/downloads
- Place binaries in `src/installer/voxshield/assets/clamav/`
- Add to `src/electron/package.json` → `build.extraResources`:
  ```json
  {
    "from": "../installer/voxshield/assets/clamav",
    "to": "clamav"
  }
  ```
- The app auto-detects ClamAV at `resources/clamav/clamdscan.exe`
- Run `freshclam.exe` on startup to update signatures

### macOS / Linux
- macOS: `brew install clamav` or bundle from source
- Linux: bundle `clamav-daemon` or require `sudo apt install clamav`
- Same IPC interface, different binary paths

---

## 2. Team Auto-Linking

### Silent Install Flags (Windows — Inno Setup)
```iss
// VoxShield.iss — add to [Run] section
[Run]
Filename: "{app}\VoxShield.exe"; Parameters: "/TEAM_TOKEN={param:TEAM_TOKEN} /AUTO_LOGIN"; \
  Description: "Launch VoxShield"; Flags: nowait postinstall skipifsilent
```

### Auto-Registration Logic (Electron main.js)
```javascript
// On first launch with team token
async function autoRegisterTeam() {
  const teamToken = process.argv.find(a => a.startsWith('/TEAM_TOKEN='))?.split('=')[1];
  if (!teamToken) return;

  // The team token IS the Client entity ID
  const clientId = teamToken;

  // Register device
  const deviceId = generateDeviceId(); // hardware hash
  const res = await api.authLogin({
    email: storedEmail,      // from silent install pre-config
    password: storedPassword,
    device_id: deviceId,
    device_name: os.hostname(),
    device_type: 'windows',
    client_id: clientId,     // links device to the business
  });

  // Fetch DNS policy for this client
  const teamData = await api.getTeamData();
  applyDnsFiltering(teamData.client.dns_filter_config);

  // Start antivirus
  antivirus.startRealtimeScan();
}
```

---

## 3. DNS Filtering (Network Level)

### Windows — Hosts File Approach
```javascript
// Block domains by redirecting to 0.0.0.0 in the Windows hosts file
// C:\Windows\System32\drivers\etc\hosts

function applyDnsFiltering(config) {
  const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  const blockList = buildBlockList(config); // categories + custom

  // Read current hosts, remove old VoxShield entries, add new ones
  let hosts = fs.readFileSync(hostsPath, 'utf8');
  hosts = hosts.replace(/# VoxShield-Block-Start[\s\S]*?# VoxShield-Block-End/g, '');
  hosts += `\n# VoxShield-Block-Start\n`;
  blockList.forEach(domain => {
    hosts += `0.0.0.0 ${domain}\n`;
  });
  hosts += `# VoxShield-Block-End\n`;

  // Requires admin privileges — installer runs as admin
  fs.writeFileSync(hostsPath, hosts);
}
```

### Alternative: DNS over HTTPS
- Route all DNS queries through a VoxDNS resolver
- Server-side filtering based on Client's `dns_filter_config`
- More robust, harder to bypass

---

## 4. Base44 Auth Integration

### All logins use the SAME Base44 auth backend:

| Surface | Auth Method | Function |
|---------|------------|----------|
| Web dashboard | Base44 SDK | `base44.auth.me()` |
| Desktop app | Email + password | `authLogin` function |
| Mobile app | Email + password | `authLogin` function |
| Silent install | Pre-configured creds | `authLogin` with stored token |

### Backend Functions (already exist — reuse):
- `authLogin` — login + device registration
- `validateSubscription` — check active/trial status
- `heartbeatPing` — keep-alive + enforcement
- `getTeamData` — fetch team info, members, DNS config
- `connectSessionStart` / `connectSessionEnd` — session tracking

### New Functions (already created):
- `businessSignup` — business account creation
- `getTeamData` — team dashboard data
- `inviteTeamMember` — invite users to team
- `removeTeamMember` — remove from team
- `updateDnsFilter` — update DNS filtering policy

---

## 5. Installer Packaging

### Windows (Inno Setup — .exe)
```iss
#define MyAppName "VoxShield Business"
#define MyAppVersion "1.0.0"
#define MyAppExeName "VoxShield.exe"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
DefaultDirName={pf}\VoxShield
DefaultGroupName=VoxShield
OutputBaseFilename=VoxShield-Business-Setup-1.0.0
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: recursesubdirs
Source: "assets\clamav\*"; DestDir: "{app}\clamav"; Flags: recursesubdirs

[Run]
Filename: "{app}\VoxShield.exe"; Parameters: "/TEAM_TOKEN={param:TEAM_TOKEN}"; \
  Flags: nowait postinstall skipifsilent
```

### Silent Deploy
```batch
VoxShield-Business-Setup-1.0.0.exe /SILENT /TEAM_TOKEN=CLIENT_ENTITY_ID /NORESTART
```

### macOS (.dmg) & Linux (.AppImage)
- Use existing `build-macos.sh` / `build-linux.sh`
- Bundle ClamAV in `extraResources`
- No silent install on macOS (use MDM/Jamf for deployment)

---

## 6. What to Send the Developer

### Files to Reference:
1. `src/electron/` — existing Electron app (extend this)
2. `src/installer/voxshield/` — existing build scripts
3. `src/docs/BUSINESS_INSTALLER_SPEC.md` — this document
4. `base44/functions/businessSignup/entry.ts` — business signup
5. `base44/functions/getTeamData/entry.ts` — team data API
6. `base44/functions/updateDnsFilter/entry.ts` — DNS policy update

### Tasks for Developer:
1. **Bundle ClamAV** into the Electron app's `extraResources`
2. **Create `src/electron/antivirus.js`** — real-time scanner + quarantine
3. **Add AntivirusPanel UI** to the Electron Dashboard
4. **Implement DNS filtering** via hosts file or DoH
5. **Add silent install flags** to Inno Setup `.iss` file
6. **Implement team auto-linking** — read `/TEAM_TOKEN` arg, auto-register
7. **Wire threat reporting** to `SecurityLog` entity
8. **Test silent deployment** on a clean Windows machine

### Base44 App ID:
```
69c84f61d5543b54fe26e1e5
```

### API Base URL:
```
https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions
```

### Key Entity IDs:
- `Client` entity — represents a business team
- `SecurityLog` entity — antivirus threat reports
- `DNSFilterLog` entity — DNS block events
- `LinkedDevice` entity — registered devices