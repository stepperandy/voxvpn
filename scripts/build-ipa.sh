#!/bin/bash
# Direct (non-EAS) App Store IPA build for VoxVPN / VoxShield iOS.
# Produces a correctly-signed App Store binary (fixes ITMS-90035 Invalid Signature).
#
# Run on a macOS machine with Xcode installed.
#
# Prereqs (one-time):
#   1. npx cap add ios && npx cap sync ios          (generates ios/App)
#   2. Import your "Apple Distribution" .p12 certificate into Keychain Access.
#   3. Download the App Store provisioning profile for net.voxvpn.mobile from
#      https://developer.apple.com/account/resources/profiles/list and install it
#      (double-click). Find its UUID:
#         security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision | plutil -p - | grep UUID
#
# Usage:
#   APPLE_TEAM_ID="ABC1234567" \
#   PROVISIONING_PROFILE_UUID="00000000-0000-0000-0000-000000000000" \
#   bash scripts/build-ipa.sh
set -euo pipefail

SCHEME="App"
CONFIG="Release"
WORKSPACE="ios/App/App.xcworkspace"
ARCHIVE_PATH="build/VoxVPN.xcarchive"
EXPORT_PATH="build/ipa"
EXPORT_OPTIONS="ios/App/ExportOptions.plist"
APP_VERSION="1.0.0"
BUILD_NUMBER="3"

if [ -z "${APPLE_TEAM_ID:-}" ]; then
  echo "❌ Set APPLE_TEAM_ID (your Apple Developer Team ID)."
  exit 1
fi
if [ -z "${PROVISIONING_PROFILE_UUID:-}" ]; then
  echo "❌ Set PROVISIONING_PROFILE_UUID (App Store profile UUID for net.voxvpn.mobile)."
  exit 1
fi
if [ ! -d "$WORKSPACE" ]; then
  echo "❌ iOS workspace not found at $WORKSPACE"
  echo "   Run: npx cap add ios && npx cap sync ios"
  exit 1
fi

# Resolve the exact "Apple Distribution" signing identity from the Keychain.
SIGNING_IDENTITY=$(security find-identity -v -p codesigning | grep "Apple Distribution" | head -1 | sed -n 's/.*"\(.*\)".*/\1/p' || true)
if [ -z "$SIGNING_IDENTITY" ]; then
  echo "❌ No 'Apple Distribution' signing identity found in Keychain."
  echo "   Import your .p12 certificate into Keychain Access first."
  exit 1
fi
echo "==> Using signing identity: $SIGNING_IDENTITY"

# Render ExportOptions.plist with the real team + profile UUID.
RENDERED_OPTIONS="build/ExportOptions.plist"
mkdir -p build
export APPLE_TEAM_ID PROVISIONING_PROFILE_UUID
envsubst < "$EXPORT_OPTIONS" > "$RENDERED_OPTIONS"

echo "==> Archiving (v$APP_VERSION build $BUILD_NUMBER)..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIG" \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  archive \
  CODE_SIGN_STYLE="Manual" \
  CODE_SIGN_IDENTITY="$SIGNING_IDENTITY" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  PROVISIONING_PROFILE_SPECIFIER="" \
  PROVISIONING_PROFILE="$PROVISIONING_PROFILE_UUID" \
  MARKETING_VERSION="$APP_VERSION" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  | xcpretty

echo "==> Exporting IPA (App Store distribution)..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$RENDERED_OPTIONS" \
  | xcpretty

IPA=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)
echo "✅ IPA ready: $IPA"
echo "   Version: $APP_VERSION  Build: $BUILD_NUMBER"
echo "   Upload to App Store Connect via Xcode → Organizer → Distribute App, or:"
echo "   xcrun altool --upload-app -f \"$IPA\" --type ios --apiKey KEY_ID --apiIssuer ISSUER_ID"