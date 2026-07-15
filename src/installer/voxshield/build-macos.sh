#!/bin/bash
set -e

# ============================================================
#  VoxShield — macOS Build Script
#  Builds the Vite frontend + Electron app and creates a .dmg
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ELECTRON_DIR="$ROOT_DIR/src/electron"
OUTPUT_DIR="$SCRIPT_DIR/output"

echo ""
echo "================================================"
echo "  VoxShield — macOS Build"
echo "================================================"
echo ""

# Step 1: Install root dependencies & build Vite frontend
echo "[1/4] Installing root dependencies..."
cd "$ROOT_DIR"
npm install

echo ""
echo "[2/4] Building Vite frontend..."
npm run build

# Step 3: Prepare electron directory
echo ""
echo "[3/4] Preparing Electron build..."
cd "$ELECTRON_DIR"
npm install
rm -rf dist
cp -r "$ROOT_DIR/dist" ./dist

# Step 4: Build with electron-builder
echo ""
echo "[4/4] Building macOS .dmg..."
mkdir -p "$OUTPUT_DIR"
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac

echo ""
echo "================================================"
echo "  Build complete!"
echo "  Output: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"/*.dmg 2>/dev/null || echo "  (check $ELECTRON_DIR for output)"
echo "================================================"