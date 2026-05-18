# VoxVPN Android — Real OpenVPN Tunnel Integration

## How It Works (End-to-End)

```
User taps Connect in React UI
        ↓
VoxVpnNative.connect({ config: "us-ny" })       [lib/vpnNativePlugin.js]
        ↓
VoxVpnPlugin.connect()                          [VoxVpnPlugin.kt — Capacitor bridge]
        ↓  reads assets/configs/us-ny.ovpn
ConfigParser.parseConfig() → VpnProfile
        ↓  saves profile to ProfileManager
VPNLaunchHelper.startOpenVpn(profile, context)  [ICS-OpenVPN]
        ↓
OpenVPNService (foreground service)
        ↓  creates TUN device via Android VpnService API
All device traffic → TUN → OpenVPN tunnel → your server
        ↓
VpnStatus.StateListener fires LEVEL_CONNECTED
        ↓
notifyListeners("vpnStatus") → React UI updates to "PROTECTED"

User taps Disconnect
        ↓
VoxVpnNative.disconnect()
        ↓
OpenVPNService.DISCONNECT_VPN intent
        ↓
TUN device torn down → normal routing restored → IP returns to carrier
```

---

## One-Time Setup (Run Once)

```bash
# From your project root:
bash android/setup-openvpn.sh
```

This script:
1. Adds ICS-OpenVPN as a git submodule
2. Copies your .ovpn files to the Android assets folder
3. Builds the web bundle and syncs Capacitor
4. Builds the debug APK

---

## Manual Steps (if you prefer)

### 1. Add ICS-OpenVPN submodule
```bash
cd android
git submodule add https://github.com/schwabe/ics-openvpn.git ics-openvpn
git submodule update --init --recursive
```

### 2. Copy .ovpn configs
```bash
mkdir -p android/app/src/main/assets/configs
cp assets/configs/*.ovpn android/app/src/main/assets/configs/
```

### 3. Build
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`
Install: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

---

## Release Build (Google Play)

```bash
cd android
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=../voxvpn.keystore \
  -Pandroid.injected.signing.store.password=STORE_PASS \
  -Pandroid.injected.signing.key.alias=voxvpn \
  -Pandroid.injected.signing.key.password=KEY_PASS
```

AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## What Makes the Tunnel Real

| Concern | How It's Handled |
|---------|-----------------|
| IP change | `redirect-gateway def1` in .ovpn routes all traffic via server |
| DNS | `dhcp-option DNS` in .ovpn sets the VPN DNS (e.g. 1.1.1.1) |
| Kill switch | Android VpnService blocks all non-tunnel traffic while connected |
| Disconnect | `DISCONNECT_VPN` intent → TUN torn down → carrier IP restored |
| Auth | `.ovpn` file contains inline `<cert>`, `<key>`, `<ca>` — no password needed |

---

## Required .ovpn Directives

Each .ovpn file must contain:
```
client
dev tun
proto udp          # or tcp
remote <server-ip> <port>
redirect-gateway def1 bypass-dhcp
dhcp-option DNS 1.1.1.1
dhcp-option DNS 8.8.8.8
<ca>
... CA cert ...
</ca>
<cert>
... client cert ...
</cert>
<key>
... client private key ...
</key>
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build error `project :ics-openvpn:main not found` | Run `git submodule update --init --recursive` |
| "Failed to start VPN: config not found" | Check file exists at `android/app/src/main/assets/configs/<name>.ovpn` |
| Connected but IP doesn't change | Add `redirect-gateway def1` to your .ovpn |
| DNS not resolving | Add `dhcp-option DNS 1.1.1.1` to your .ovpn |
| AUTH_FAILED | Your server requires username/password — set `profile.mUsername` / `profile.mPassword` in `VoxVpnPlugin.kt` before calling `VPNLaunchHelper.startOpenVpn()` |
| Android 14 crash | `foregroundServiceType="connectedDevice"` is already set in AndroidManifest.xml |