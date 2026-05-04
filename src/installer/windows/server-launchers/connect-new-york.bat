@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)
taskkill /IM openvpn.exe /F >nul 2>&1
timeout /t 3 >nul
"C:\Program Files\OpenVPN\bin\openvpn.exe" --config "C:\Program Files\OpenVPN\config\new-york.ovpn" --log "%TEMP%\voxvpn.log"