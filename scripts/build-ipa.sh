#!/bin/bash
# Direct (non-EAS) App Store IPA build for VoxVPN / VoxShield iOS.
# Run on a macOS machine with Xcode installed.
#
# Prereqs:
#   1. npx cap add ios && npx cap sync ios   (generates ios/App)
#   2. Open ios/App/App.xcworkspace in Xcode ONCE and set the Signing & Capabilities
#      team to your Apple Developer account (lets Xcode create the distribution cert
#      + provisioning profile automatically). You only do this once.
#   3. export APPLE_TEAM_ID="YOUR_TEAM_ID"
#
# Usage: bash scripts/build-ipa.sh
set -euo pipefail

SCHEME="App"
CONFIG="Release"
WORKSPACE="ios/App/App.xcworkspace"
ARCHIVE_PATH="build/VoxVPN.xcarchive"
EXPORT_PATH="build/ipa"
EXPORT_OPTIONS="ios/App/ExportOptions.plist"

if [ ! -f "$EXPORT_OPTIONS" ]; then
  echo "❌ Missing $EXPORT_OPTIONS — cannot export IPA without it."
  exit 1
fi

if [ ! -d "$WORKSPACE" ]; then
  echo "❌ iOS workspace not found at $WORKSPACE"
  echo "   Run: npx cap add ios && npx cap sync ios"
  exit 1
fi

echo "==> Archiving..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIG" \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  archive \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM="${APPLE_TEAM_ID:-}" \
  | xcpretty

echo "==> Exporting IPA..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  | xcpretty

IPA=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)
echo "✅ IPA ready: $IPA"