# VoxShield Business Installer — Executive Features

> **For:** Desktop Developer
> **Date:** July 15, 2026
> **App ID:** `69c84f61d5543b54fe26e1e5`
> **API Base:** `https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions`
> **Source:** `src/electron/` (existing Electron app — extend this)

---

## FEATURE LIST

### 1. Automated Threat Reporting
**Priority:** P0 (Critical)

**What it does:** When ClamAV detects malware, the agent automatically:
1. Quarantines the infected file
2. Disconnects the VPN tunnel (prevents data exfiltration)
3. Sends a real-time alert to the admin dashboard
4. Logs a `threat_detected` event to the backend

**API call (already exists):**
```http
POST /logSecurityEvent
Headers: Authorization: Bearer <token>
Body: {
  "event_type": "threat_detected",
  "severity": "critical",
  "message": "Malware detected: <filename>",
  "device_name": "<hostname>"
}
```

**Admin sees:** Alert appears in the dashboard notification bell + alerts banner within 60 seconds.

**Desktop code location:** `src/electron/antivirus.js` (new file — see BUSINESS_INSTALLER_SPEC.md section 1)

---

### 2. Remote Device Lock / Wipe
**Priority:** P0 (Critical)

**What it does:** Admin clicks "Lock Device" in the dashboard → device receives command on next heartbeat → agent purges all credentials, disconnects VPN, and shows a lock screen.

**API call (already exists):**
```http
POST /revokeDeviceSession
Headers: Authorization: Bearer <token>
Body: { "device_id": "<device_hash>" }
```

**Desktop implementation:**
1. On each `heartbeatPing` response, check for `wipe_command: true` or `locked: true`
2. If received:
   - Delete stored auth token (Windows DPAPI)
   - Delete all `.ovpn` config files
   - Kill OpenVPN process
   - Show full-screen lock window: "This device has been remotely locked by your administrator"
3. Require admin re-authorization to unlock

**New endpoint needed:** Add a `locked` boolean field to the `LinkedDevice` entity. Admin sets it via dashboard. Heartbeat returns it.

---

### 3. Secure Connection Loss Detection
**Priority:** P0 (Critical)

**What it does:** When a device's VPN disconnects unexpectedly, the admin dashboard shows an alert within 60 seconds.

**API call (already exists):**
```http
POST /logSecurityEvent
Headers: Authorization: Bearer <token>
Body: {
  "event_type": "vpn_disconnect",
  "severity": "warning",
  "message": "VPN disconnected on <hostname>",
  "device_name": "<hostname>"
}
```

**Desktop implementation:**
1. Monitor OpenVPN process state
2. On unexpected disconnect (not user-initiated), immediately call `logSecurityEvent`
3. Also call `connectSessionEnd` with bandwidth stats

**Admin sees:** Warning alert in notification bell: "Secure Connection Lost — DeviceName disconnected from VPN"

---

### 4. Antivirus Update Required
**Priority:** P1 (High)

**What it does:** When ClamAV signatures are outdated (>7 days), the agent creates a stored alert that appears in the admin dashboard.

**New API call (create BusinessAlert record):**
```http
POST (to Base44 SDK — create entity)
Headers: Authorization: Bearer <token>
Body: {
  "alert_type": "antivirus_update",
  "severity": "warning",
  "title": "Antivirus Update Required",
  "message": "ClamAV signatures on <hostname> are <X> days old",
  "device_name": "<hostname>",
  "is_resolved": false
}
```

**Desktop implementation:**
1. On startup, check `freshclam` last update timestamp
2. If >7 days, create a `BusinessAlert` record via SDK
3. Run `freshclam.exe` to update
4. On successful update, set `is_resolved: true` on the alert

**Admin sees:** Warning in notification bell: "Antivirus Update Required — DeviceName signatures are 8 days old"

---

### 5. Device Offline Detection
**Priority:** P1 (High)

**What it does:** If a device hasn't sent a heartbeat in >1 hour, the admin dashboard flags it as offline.

**Already handled:** The backend `getBusinessAlerts` function checks `LinkedDevice.status` and `last_connected` timestamps. The desktop agent just needs to:

1. Send `heartbeatPing` every 60 seconds while VPN is connected
2. Send `connectSessionEnd` with `status: "inactive"` on clean shutdown
3. On next startup, send `connectSessionStart` with `status: "active"`

**Admin sees:** Warning alert: "DeviceName has been offline for 3h"

---

### 6. Real-Time Policy Enforcement
**Priority:** P1 (High)

**What it does:** If admin changes DNS filtering policy, the agent picks it up on next heartbeat and applies it immediately.

**API flow:**
1. Admin updates policy via dashboard → `updateDnsFilter` function
2. Agent calls `heartbeatPing` → response includes `policy_updated: true`
3. Agent re-fetches `getTeamData` → gets new `dns_filter_config`
4. Agent updates hosts file blocklist

**Desktop implementation:**
```javascript
const hb = await api.heartbeat(token, deviceId, serverId);
if (hb.policy_updated) {
  const teamData = await api.getTeamData(token);
  applyDnsFiltering(teamData.client.dns_filter_config);
}
```

---

### 7. Executive Compliance Reports
**Priority:** P2 (Medium)

**What it does:** Monthly PDF report showing per-device VPN usage, threats blocked, DNS blocks, and policy compliance.

**Desktop responsibility:**
1. Track locally: connect time, bandwidth, threats blocked, DNS blocks
2. Send aggregated stats via heartbeat or a new `reportDeviceStats` endpoint
3. Backend generates PDF from `SecurityReport` entity

**Stats to track per device:**
- VPN connected hours (per day/month)
- Total bandwidth (GB)
- Threats blocked count
- DNS queries blocked count
- Last antivirus scan date
- Last signature update date

---

### 8. White-Label Branding
**Priority:** P2 (Medium)

**What it does:** Installer and tray icon show the agency's logo and brand colors instead of VoxVPN defaults.

**API data source:**
```javascript
const teamData = await api.getTeamData(token);
// teamData.client.agency.logo_url
// teamData.client.agency.brand_color
// teamData.client.agency.white_label_enabled
```

**Desktop implementation:**
1. On first launch, fetch branding via `getTeamData`
2. Download `logo_url` and cache to `%APPDATA%/VoxShield/branding/`
3. Replace:
   - System tray icon
   - Window title bar
   - Splash screen image
   - About dialog
4. Apply `brand_color` to UI accents (buttons, active states)

---

### 9. Geo-Fencing (Auto-VPN in High-Risk Regions)
**Priority:** P3 (Low — future)

**What it does:** Force VPN ON when the device enters a high-risk country. Block connections from unauthorized regions.

**Desktop implementation:**
1. Check device geolocation via OS APIs or IP-based lookup
2. If in a restricted region, auto-connect VPN
3. If in a blocked region, show "Connection blocked by policy" and alert admin

**New endpoint needed:** `geo_policy` field on Client entity with allowed/blocked country lists.

---

### 10. App-Level Split Tunneling
**Priority:** P3 (Low — future)

**What it does:** Route only corporate apps (Slack, internal tools) through VPN. Leave the rest on direct internet for speed.

**Desktop implementation:**
1. Admin configures app list in dashboard (stored on Client entity)
2. Agent fetches list via `getTeamData`
3. OpenVPN split-tunnel config includes only specified app PIDs

---

## IMPLEMENTATION PRIORITY

| Priority | Feature | Effort |
|----------|---------|--------|
| P0 | Automated Threat Reporting | 2 days |
| P0 | Remote Device Lock / Wipe | 3 days |
| P0 | Secure Connection Loss Detection | 1 day |
| P1 | Antivirus Update Required | 1 day |
| P1 | Device Offline Detection | 0.5 days (heartbeat only) |
| P1 | Real-Time Policy Enforcement | 1 day |
| P2 | Executive Compliance Reports | 3 days |
| P2 | White-Label Branding | 2 days |
| P3 | Geo-Fencing | 3 days |
| P3 | App-Level Split Tunneling | 2 days |

**Total estimated effort:** ~18.5 developer-days

---

## EXISTING API ENDPOINTS (reuse — do not recreate)

| Function | Purpose |
|----------|---------|
| `authLogin` | Login + device registration |
| `heartbeatPing` | 60s keep-alive + policy check |
| `getTeamData` | Team info, DNS config, branding |
| `logSecurityEvent` | Report threats, disconnects |
| `connectSessionStart` / `connectSessionEnd` | VPN session tracking |
| `revokeDeviceSession` | Remote device revoke |
| `updateDnsFilter` | DNS policy update |
| `getBusinessAlerts` | Fetch admin alerts (NEW) |

---

## NEW ENTITY: BusinessAlert

The admin dashboard now has a `BusinessAlert` entity. The desktop agent creates records here for:
- Antivirus update required
- Policy violations
- Custom alerts

**Schema:**
```
- client_id, agency_id, user_email, device_name
- alert_type: "device_disconnect" | "device_offline" | "antivirus_update" | "threat_detected" | "policy_violation"
- severity: "info" | "warning" | "critical"
- title, message
- is_resolved (bool), resolved_at, resolved_by
- timestamp
```

**Create from desktop:**
```javascript
await fetch(`${BASE}/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    alert_type: 'antivirus_update',
    severity: 'warning',
    title: 'Antivirus Update Required',
    message: `Signatures on ${hostname} are ${daysOld} days old`,
    device_name: hostname,
    user_email: userEmail,
    is_resolved: false,
    timestamp: new Date().toISOString()
  })
});
```

---

## QUESTIONS?

Refer to:
- `src/docs/BUSINESS_INSTALLER_SPEC.md` — full architecture spec
- `src/docs/DEVELOPER_HANDOFF.md` — complete developer handoff
- `src/electron/api.js` — existing API client (all endpoints wrapped)
- `src/electron/package.json` — build configuration