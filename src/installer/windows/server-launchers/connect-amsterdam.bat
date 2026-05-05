@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)

echo Killing existing OpenVPN...
taskkill /IM openvpn.exe /F >nul 2>&1
timeout /t 2 >nul

echo Checking OpenVPN install...
if not exist "C:\Program Files\OpenVPN\bin\openvpn.exe" (
  echo ERROR: openvpn.exe not found!
  echo Please install OpenVPN from: https://openvpn.net/community-downloads/
  pause
  exit /b 1
)

echo Checking config file...
if not exist "C:\Program Files\OpenVPN\config\amsterdam.ovpn" (
  echo ERROR: amsterdam.ovpn not found in C:\Program Files\OpenVPN\config\
  echo Please copy your .ovpn file there first.
  pause
  exit /b 1
)

echo Connecting to Amsterdam...
"C:\Program Files\OpenVPN\bin\openvpn.exe" --config "C:\Program Files\OpenVPN\config\amsterdam.ovpn" --log "%TEMP%\voxvpn.log"

echo.
echo OpenVPN exited. Check log at: %TEMP%\voxvpn.log
pause