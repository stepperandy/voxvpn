#!/bin/bash
# VoxVPN macOS Installer Builder (OpenVPN)
set -e

echo "================================================"
echo "  VoxVPN macOS Installer Builder"
echo "================================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org"
  exit 1
fi

# Check for Homebrew (used to install OpenVPN)
if ! command -v brew &> /dev/null; then
  echo "WARNING: Homebrew not found. OpenVPN must be installed manually."
  echo "Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
fi

echo "[1/4] Installing npm dependencies..."
cd ../..
npm install

echo ""
echo "[2/4] Building Electron app (macOS DMG)..."
npx electron-builder --mac dmg

echo ""
echo "[3/4] Copying .ovpn configs into app bundle..."
APP_PATH="dist/mac/VoxVPN.app/Contents/Resources/configs"
mkdir -p "$APP_PATH"
cp installer/assets/configs/*.ovpn "$APP_PATH/" 2>/dev/null || echo "No .ovpn configs found in installer/assets/configs/"

echo ""
echo "[4/4] Done! Installer located at:"
ls dist/*.dmg 2>/dev/null || echo "  dist/ folder"

echo ""
echo "================================================"
echo "  NOTE: To code-sign the DMG:"
echo "  codesign --deep --force --verify --verbose"
echo "    --sign 'Developer ID Application: Your Name'"
echo "    dist/VoxVPN-1.0.0.dmg"
echo "================================================"