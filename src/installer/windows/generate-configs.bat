@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   VoxVPN - Generate Server Config Files
echo ================================================
echo.
echo This will create .ovpn files for each server
echo and place them in: installer\assets\configs\
echo.

:: ── Create configs folder ─────────────────────────────────────────────────────
if not exist "..\..\assets\configs" mkdir "..\..\assets\configs"
set OUT=..\..\assets\configs

:: ── Your CA Certificate ───────────────────────────────────────────────────────
:: Paste your CA cert between the lines below (from your VPN server)
set CA_CERT=-----BEGIN CERTIFICATE-----
:: ADD YOUR CA CERT LINES HERE
set CA_CERT_END=-----END CERTIFICATE-----

:: ── Helper: write one .ovpn file ─────────────────────────────────────────────
:: Usage: call :WriteOvpn <filename> <ip> <port> <proto> <city> <country>
goto :main

:WriteOvpn
set FNAME=%~1
set IP=%~2
set PORT=%~3
set PROTO=%~4
set CITY=%~5
set COUNTRY=%~6

echo Generating %FNAME%.ovpn  [%CITY%, %COUNTRY%  %IP%:%PORT% %PROTO%]

(
echo # VoxVPN Config - %CITY%, %COUNTRY%
echo client
echo dev tun
echo proto %PROTO%
echo remote %IP% %PORT%
echo resolv-retry infinite
echo nobind
echo persist-key
echo persist-tun
echo remote-cert-tls server
echo cipher AES-256-CBC
echo auth SHA256
echo compress lz4-v2
echo verb 3
echo keepalive 10 60
echo auth-user-pass
echo.
echo ^<ca^>
echo -----BEGIN CERTIFICATE-----
echo PASTE_YOUR_CA_CERT_HERE
echo -----END CERTIFICATE-----
echo ^</ca^>
) > "%OUT%\%FNAME%.ovpn"

goto :eof

:: ── ADD YOUR SERVERS HERE ─────────────────────────────────────────────────────
:main

echo.
echo Generating configs...
echo.

:: Format: call :WriteOvpn  filename          ip-address       port  proto  city            country
call :WriteOvpn  us-new-york        1.2.3.4          1194  udp    New-York        US
call :WriteOvpn  us-los-angeles     1.2.3.5          1194  udp    Los-Angeles     US
call :WriteOvpn  uk-london          2.3.4.5          1194  udp    London          UK
call :WriteOvpn  de-frankfurt       3.4.5.6          1194  udp    Frankfurt       DE
call :WriteOvpn  sg-singapore       4.5.6.7          1194  udp    Singapore       SG
call :WriteOvpn  jp-tokyo           5.6.7.8          1194  udp    Tokyo           JP
call :WriteOvpn  au-sydney          6.7.8.9          1194  udp    Sydney          AU
call :WriteOvpn  nl-amsterdam       7.8.9.10         1194  udp    Amsterdam       NL

echo.
echo ================================================
echo   Done! Config files saved to:
echo   installer\assets\configs\
echo ================================================
echo.
echo IMPORTANT: Open each .ovpn file and replace
echo PASTE_YOUR_CA_CERT_HERE with your actual CA cert.
echo.
pause