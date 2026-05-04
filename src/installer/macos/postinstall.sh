#!/bin/bash
# Runs after VoxVPN.app is installed on the user's Mac
# This script installs OpenVPN via Homebrew and copies configs

echo "VoxVPN post-install: Setting up OpenVPN..."

# Install OpenVPN if not present
if ! command -v openvpn &> /dev/null; then
  if command -v brew &> /dev/null; then
    echo "Installing OpenVPN via Homebrew..."
    brew install openvpn
  else
    echo "WARNING: OpenVPN not found and Homebrew not available."
    echo "Please install OpenVPN manually: brew install openvpn"
    echo "Or install Tunnelblick (OpenVPN GUI): https://tunnelblick.net"
  fi
else
  echo "OpenVPN already installed, skipping."
fi

# Copy .ovpn configs to standard OpenVPN location
OPENVPN_CONFIG_DIR="$HOME/Library/Application Support/OpenVPN/config"
APP_CONFIGS="$(dirname "$0")/../Resources/configs"

if [ -d "$APP_CONFIGS" ]; then
  mkdir -p "$OPENVPN_CONFIG_DIR"
  cp "$APP_CONFIGS"/*.ovpn "$OPENVPN_CONFIG_DIR/" 2>/dev/null && \
    echo "OpenVPN configs copied to $OPENVPN_CONFIG_DIR" || \
    echo "No .ovpn configs found to copy."
fi

echo "VoxVPN post-install complete."