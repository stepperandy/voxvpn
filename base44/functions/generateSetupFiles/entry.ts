import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const setupTemplates = {
  windows: `; VoxVPN WireGuard Installer for Windows
; Built with NSIS - Compile to EXE
; Download NSIS from https://nsis.sourceforge.io/

!include "MUI2.nsh"
!include "x64.nsh"

; Configuration
Name "VoxVPN"
OutFile "VoxVPN-Installer.exe"
InstallDir "$PROGRAMFILES\\VoxVPN"
InstallDirRegKey HKLM "Software\\VoxVPN" "InstallDir"

; Branding
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "banner.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "header.bmp"
!define MUI_INSTFILESDIR "Installation Progress"

; Variables
Var WireGuardPath
Var ConfigPath

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "English"

; Installer Functions
Function .onInit
  $\{If} $\{RunningX64}
    Set $WireGuardPath "$PROGRAMFILES64\\\\WireGuard"
  $\{Else}
    Set $WireGuardPath "$PROGRAMFILES\\\\WireGuard"
  $\{EndIf}
  Set $ConfigPath "$APPDATA\\\\WireGuard\\\\Configurations"
FunctionEnd

; Install Sections
Section "Install WireGuard"
  SetOutPath "$TEMP"
  
  ; Download WireGuard if not installed
  $\{If} $\{FileExists} "$WireGuardPath\\\\wireguard.exe"
    DetailPrint "WireGuard already installed"
  $\{Else}
    DetailPrint "Downloading WireGuard..."
    inetc::get /POPUP "Downloading WireGuard..." /END "https://download.wireguard.com/windows-client/wireguard-amd64-0.5.3.msi" "$TEMP\\\\wireguard.msi"
    DetailPrint "Installing WireGuard..."
    ExecWait 'msiexec.exe /i "$TEMP\\\\wireguard.msi" /quiet /norestart'
    Delete "$TEMP\\\\wireguard.msi"
  $\{EndIf}
SectionEnd

Section "Install VoxVPN Configuration"
  CreateDirectory "$ConfigPath"
  
  ; Create VPN config
  FileOpen $9 "$ConfigPath\\\\VoxVPN.conf" w
  FileWrite $9 "[Interface]$\\\\r$\\\\n"
  FileWrite $9 "Address = 10.0.0.2/32$\\\\r$\\\\n"
  FileWrite $9 "DNS = 8.8.8.8, 8.8.4.4$\\\\r$\\\\n"
  FileWrite $9 "PrivateKey = REPLACE_WITH_PRIVATE_KEY$\\\\r$\\\\n"
  FileWrite $9 "$\\\\r$\\\\n"
  FileWrite $9 "[Peer]$\\\\r$\\\\n"
  FileWrite $9 "PublicKey = REPLACE_WITH_PUBLIC_KEY$\\\\r$\\\\n"
  FileWrite $9 "AllowedIPs = 0.0.0.0/0$\\\\r$\\\\n"
  FileWrite $9 "Endpoint = vpn.voxvpn.com:51820$\\\\r$\\\\n"
  FileWrite $9 "PersistentKeepalive = 25$\\\\r$\\\\n"
  FileClose $9
  
  DetailPrint "VPN configuration installed"
SectionEnd

Section "Create Shortcuts"
  CreateDirectory "$SMPROGRAMS\\\\VoxVPN"
  CreateShortCut "$SMPROGRAMS\\\\VoxVPN\\\\WireGuard.lnk" "$WireGuardPath\\\\wireguard.exe"
  CreateShortCut "$SMPROGRAMS\\\\VoxVPN\\\\Uninstall.lnk" "$INSTDIR\\\\uninstall.exe"
  CreateShortCut "$DESKTOP\\\\WireGuard VPN.lnk" "$WireGuardPath\\\\wireguard.exe"
SectionEnd

Section "Write Uninstaller"
  WriteRegStr HKLM "Software\\\\VoxVPN" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\VoxVPN" "DisplayName" "VoxVPN"
  WriteRegStr HKLM "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\VoxVPN" "UninstallString" "$INSTDIR\\\\uninstall.exe"
  WriteUninstaller "$INSTDIR\\\\uninstall.exe"
SectionEnd

; Uninstaller
Section "Uninstall"
  RMDir /r "$SMPROGRAMS\\\\VoxVPN"
  Delete "$DESKTOP\\\\WireGuard VPN.lnk"
  Delete "$APPDATA\\\\WireGuard\\\\Configurations\\\\VoxVPN.conf"
  DeleteRegKey HKLM "Software\\\\VoxVPN"
  DeleteRegKey HKLM "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\VoxVPN"
SectionEnd`,

  macos: `[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  linux: `[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  ios: `[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  android: `[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  router: `[Interface]
Address = 10.0.0.1/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY
ListenPort = 51820

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const platform = body.platform?.toLowerCase();

    if (!platform || !setupTemplates[platform]) {
      return Response.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const content = setupTemplates[platform];
    const ext = platform === 'windows' ? 'nsi' : 'conf';
    const fileName = `VoxVPN-${platform.charAt(0).toUpperCase() + platform.slice(1)}-Setup.${ext}`;
    const mimeType = platform === 'windows' ? 'text/plain' : 'text/plain';

    return Response.json({
      success: true,
      content,
      fileName,
      mimeType,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});