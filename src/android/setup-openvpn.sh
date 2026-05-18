#!/bin/bash
# =============================================================================
# VoxVPN Android — OpenVPN Integration Setup
# Run this ONCE from the project root to wire up ICS-OpenVPN.
# =============================================================================
set -e

echo "==> Step 1: Add ICS-OpenVPN as git submodule"
cd android
git submodule add https://github.com/schwabe/ics-openvpn.git ics-openvpn || true
git submodule update --init --recursive
cd ..

echo "==> Step 2: Copy .ovpn configs to Android assets"
mkdir -p android/app/src/main/assets/configs
cp assets/configs/*.ovpn android/app/src/main/assets/configs/
echo "     Copied $(ls android/app/src/main/assets/configs/*.ovpn | wc -l) .ovpn files"

echo "==> Step 3: Build web bundle and sync Capacitor"
npm run build
npx cap sync android

echo "==> Step 4: Build debug APK"
cd android
chmod +x gradlew
./gradlew assembleDebug
cd ..

APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK" ]; then
  echo ""
  echo "✅  APK built: $APK"
  echo "    Install: adb install -r $APK"
else
  echo "❌  Build failed — check output above"
  exit 1
fi