@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)
taskkill /IM openvpn.exe /F >nul 2>&1
echo VPN Disconnected.
timeout /t 2 >nul