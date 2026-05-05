@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)
taskkill /IM openvpn.exe /F >nul 2>&1
taskkill /IM openvpn-gui.exe /F >nul 2>&1
timeout /t 2 >nul
"C:\Program Files\OpenVPN\bin\openvpn.exe" --config "C:\Users\user\Downloads\Amsterdam.ovpn" --log "%TEMP%\voxvpn.log"
pause