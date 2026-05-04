#!/bin/bash
# VoxVPN Linux Installer (OpenVPN)
# Supports: Ubuntu/Debian, Fedora/RHEL, Arch Linux

set -e

echo "================================================"
echo "  VoxVPN Linux Installer"
echo "================================================"
echo ""

# Must run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo bash install.sh"
  exit 1
fi

INSTALL_DIR="/opt/voxvpn"
CONFIG_DIR="/etc/openvpn/client"
DESKTOP_FILE="/usr/share/applications/voxvpn.desktop"

# Detect distro
detect_distro() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "$ID"
  elif command -v lsb_release &> /dev/null; then
    lsb_release -si | tr '[:upper:]' '[:lower:]'
  else
    echo "unknown"
  fi
}

DISTRO=$(detect_distro)
echo "Detected: $DISTRO"
echo ""

# Install OpenVPN
install_openvpn() {
  echo "[1/4] Installing OpenVPN..."
  case "$DISTRO" in
    ubuntu|debian|linuxmint|pop)
      apt-get update -qq
      apt-get install -y openvpn resolvconf
      ;;
    fedora)
      dnf install -y openvpn
      ;;
    centos|rhel|rocky|almalinux)
      yum install -y epel-release
      yum install -y openvpn
      ;;
    arch|manjaro)
      pacman -Sy --noconfirm openvpn
      ;;
    opensuse*|suse)
      zypper install -y openvpn
      ;;
    *)
      echo "WARNING: Unknown distro '$DISTRO'. Trying apt-get..."
      apt-get install -y openvpn || echo "Please install OpenVPN manually."
      ;;
  esac
  echo "OpenVPN installed."
}

# Install VoxVPN app
install_app() {
  echo ""
  echo "[2/4] Installing VoxVPN app..."
  mkdir -p "$INSTALL_DIR"

  # Copy AppImage or unpacked app
  if [ -f "VoxVPN.AppImage" ]; then
    cp VoxVPN.AppImage "$INSTALL_DIR/VoxVPN"
    chmod +x "$INSTALL_DIR/VoxVPN"
  elif [ -d "linux-unpacked" ]; then
    cp -r linux-unpacked/* "$INSTALL_DIR/"
    chmod +x "$INSTALL_DIR/voxvpn"
  else
    echo "ERROR: No VoxVPN app found. Build first with: npx electron-builder --linux"
    exit 1
  fi
  echo "VoxVPN installed to $INSTALL_DIR"
}

# Copy OpenVPN config files
install_configs() {
  echo ""
  echo "[3/4] Copying OpenVPN configs..."
  mkdir -p "$CONFIG_DIR"

  if [ -d "configs" ] && ls configs/*.ovpn &>/dev/null; then
    cp configs/*.ovpn "$CONFIG_DIR/"
    echo "Configs copied to $CONFIG_DIR"
  else
    echo "WARNING: No .ovpn files found in ./configs/ — skipping."
    echo "Place your .ovpn files in ./configs/ and re-run."
  fi
}

# Create desktop shortcut
create_desktop_entry() {
  echo ""
  echo "[4/4] Creating desktop shortcut..."
  cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=VoxVPN
Comment=Military-grade VPN protection
Exec=$INSTALL_DIR/VoxVPN
Icon=$INSTALL_DIR/resources/icon.png
Terminal=false
Type=Application
Categories=Network;Security;
StartupNotify=true
EOF
  chmod 644 "$DESKTOP_FILE"
  update-desktop-database 2>/dev/null || true
  echo "Desktop shortcut created."
}

# Enable OpenVPN service on boot (optional)
enable_service() {
  if command -v systemctl &> /dev/null; then
    systemctl enable openvpn-client@voxvpn 2>/dev/null || true
  fi
}

# Run all steps
install_openvpn
install_app
install_configs
create_desktop_entry
enable_service

echo ""
echo "================================================"
echo "  VoxVPN installed successfully!"
echo "  Launch: $INSTALL_DIR/VoxVPN"
echo "  Or find it in your applications menu."
echo "================================================"