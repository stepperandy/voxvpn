# VoxVPN Installer Scripts

All installers use **OpenVPN** as the VPN backend.

## Folder Structure

```
installer/
├── windows/
│   ├── VoxVPN.iss          ← Inno Setup script
│   ├── build.bat           ← One-click Windows builder
│   └── README.md
├── macos/
│   ├── build.sh            ← macOS DMG builder
│   └── postinstall.sh      ← Runs after .app install
├── linux/
│   └── install.sh          ← Linux installer (multi-distro)
├── assets/
│   └── configs/            ← Place your .ovpn files here
│       ├── us-new-york.ovpn
│       ├── uk-london.ovpn
│       └── ...
└── README.md
```

## Before Building — Add Your .ovpn Configs

Place all your server `.ovpn` files in `installer/assets/configs/`.
These get bundled into the installer and copied to the right location on each OS:

| OS      | Config destination |
|---------|-------------------|
| Windows | `C:\Users\All Users\OpenVPN\config\` |
| macOS   | `~/Library/Application Support/OpenVPN/config/` |
| Linux   | `/etc/openvpn/client/` |

## Platform Guides

### Windows
1. Install [Inno Setup 6](https://jrsoftware.org/isinfo.php)
2. Download [OpenVPN installer](https://openvpn.net/community-downloads/) → `installer/windows/assets/openvpn-installer.exe`
3. Run `installer/windows/build.bat`

### macOS
```bash
chmod +x installer/macos/build.sh
bash installer/macos/build.sh
```

### Linux
```bash
chmod +x installer/linux/install.sh
sudo bash installer/linux/install.sh
```

## OpenVPN Config Tips

Each `.ovpn` file should include:
- `remote <server-ip> 1194` (or your port)
- `proto udp` or `proto tcp`
- Inline certs (`<ca>`, `<cert>`, `<key>`, `<tls-auth>`)
- `auth-user-pass` if using username/password auth