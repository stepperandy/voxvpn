; VoxVPN Windows Installer Script (OpenVPN)
; Requires Inno Setup 6+ from https://jrsoftware.org/isinfo.php

#define MyAppName "VoxVPN"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "VoxVPN"
#define MyAppURL "https://voxvpn.net"
#define MyAppExeName "VoxVPN.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/contact
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; Admin required so OpenVPN TAP driver can install
PrivilegesRequired=admin
OutputDir=output
OutputBaseFilename=VoxVPN-Setup-{#MyAppVersion}
SetupIconFile=assets\icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
MinVersion=10.0.17763
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startupicon"; Description: "Launch VoxVPN on Windows startup"; GroupDescription: "Startup Options:"

[Files]
; Main Electron app
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; OpenVPN installer (bundled) — download from https://openvpn.net/community-downloads/
Source: "assets\openvpn-installer.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

; Default .ovpn config files — place your server configs here
Source: "assets\configs\*.ovpn"; DestDir: "{app}\configs"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
; Install OpenVPN silently first (includes TAP driver)
Filename: "{tmp}\openvpn-installer.exe"; Parameters: "/S /SELECT_OPENVPN=1 /SELECT_OPENVPNGUI=0 /SELECT_TAP=1 /SELECT_OPENSSL_UTILITIES=0 /SELECT_EASY_RSA=0 /SELECT_PATH=1"; StatusMsg: "Installing OpenVPN TAP driver..."; Flags: waitprocfinished

; Copy .ovpn configs to OpenVPN config folder
Filename: "xcopy"; Parameters: """{app}\configs\*"" ""{commonappdata}\OpenVPN\config\"" /Y /E"; Flags: runhidden waitprocfinished

; Launch VoxVPN after install
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; Kill VoxVPN before uninstall
Filename: "taskkill"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runhidden waitprocfinished
; Kill any running OpenVPN processes
Filename: "taskkill"; Parameters: "/F /IM openvpn.exe"; Flags: runhidden waitprocfinished

[Code]
// Check if OpenVPN is already installed
function OpenVPNInstalled(): Boolean;
begin
  Result := RegKeyExists(HKLM, 'SOFTWARE\OpenVPN') or
            RegKeyExists(HKLM, 'SOFTWARE\WOW6432Node\OpenVPN');
end;

// Kill app if already running
procedure KillRunningApp();
var
  ResultCode: Integer;
begin
  Exec('taskkill', '/F /IM ' + '{#MyAppExeName}', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec('taskkill', '/F /IM openvpn.exe', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function InitializeSetup(): Boolean;
begin
  KillRunningApp();
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then begin
    if OpenVPNInstalled() then begin
      Log('OpenVPN already installed, skipping OpenVPN installer...');
    end;
  end;
end;