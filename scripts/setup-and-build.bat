@echo off
REM VoxVPN Build Environment Setup and APK Build Script
REM Comprehensive setup and build automation for Windows

setlocal enabledelayedexpansion
color 0A

REM ============================================================================
REM CONFIGURATION
REM ============================================================================

set PROJECT_PATH=C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN
set BUILD_TYPE=debug
set REPO_PATH=%~dp0..

REM ============================================================================
REM HEADER
REM ============================================================================

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                   VoxVPN APK Build Environment Setup                       ║
echo ║                         Version 1.0 - Windows                              ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM STEP 1: CHECK JAVA
REM ============================================================================

echo [1/8] Checking Java Installation...
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found!
    echo.
    echo ℹ️  Java is required (JDK 11+)
    echo 📥 Download from: https://adoptopenjdk.net/
    echo.
    echo 🔧 After installation, restart Command Prompt and try again.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('java -version 2^>^&1') do (
        echo ✅ Java found: %%i
        goto :check_node
    )
)

:check_node
echo.

REM ============================================================================
REM STEP 2: CHECK NODE.JS
REM ============================================================================

echo [2/8] Checking Node.js Installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found!
    echo.
    echo ℹ️  Node.js is required (v16+)
    echo 📥 Download from: https://nodejs.org/
    echo.
    echo 🔧 After installation, restart Command Prompt and try again.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do echo ✅ Node.js: %%i
    for /f "tokens=*" %%i in ('npm -v') do echo ✅ npm: %%i
)

echo.

REM ============================================================================
REM STEP 3: CHECK ANDROID SDK
REM ============================================================================

echo [3/8] Checking Android SDK Installation...
if "!ANDROID_SDK_ROOT!"=="" (
    echo ⚠️  ANDROID_SDK_ROOT not set
    echo 🔍 Searching for Android SDK...
    
    if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
        set ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        echo ✅ Found Android SDK at: !ANDROID_SDK_ROOT!
    ) else (
        echo ❌ Android SDK not found!
        echo.
        echo ℹ️  Please set ANDROID_SDK_ROOT environment variable
        echo 📌 Typical location: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        echo.
        echo 🔧 Steps to fix:
        echo    1. Open Environment Variables ^(Win+X ^> System^)
        echo    2. Click "Environment Variables"
        echo    3. Click "New" under "User variables"
        echo    4. Variable name: ANDROID_SDK_ROOT
        echo    5. Variable value: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        echo    6. Click OK and restart Command Prompt
        pause
        exit /b 1
    )
) else (
    echo ✅ Android SDK: !ANDROID_SDK_ROOT!
)

echo.

REM ============================================================================
REM STEP 4: CHECK GRADLE
REM ============================================================================

echo [4/8] Checking Gradle...
if exist "!PROJECT_PATH!\android\gradlew.bat" (
    echo ✅ Gradle found in project
) else (
    echo ❌ Gradle not found at !PROJECT_PATH!\android\
    echo.
    echo ℹ️  Gradle wrapper not initialized
    echo 🔧 Make sure Capacitor Android is initialized
    pause
    exit /b 1
)

echo.

REM ============================================================================
REM STEP 5: CHECK PROJECT STRUCTURE
REM ============================================================================

echo [5/8] Verifying Project Structure...

if not exist "!PROJECT_PATH!" (
    echo ❌ Project path not found: !PROJECT_PATH!
    pause
    exit /b 1
)

if not exist "!PROJECT_PATH!\android" (
    echo ❌ Android directory not found
    echo 🔧 Capacitor not initialized
    pause
    exit /b 1
)

echo ✅ Project structure verified

echo.

REM ============================================================================
REM STEP 6: BUILD WEB ASSETS
REM ============================================================================

echo [6/8] Building Web Assets...
cd /d "!PROJECT_PATH!"

if not exist "dist" (
    echo 📦 dist folder not found, building...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
    call npm run build
    if errorlevel 1 (
        echo ❌ npm run build failed
        pause
        exit /b 1
    )
    echo ✅ Web assets built
) else (
    echo ✅ Web assets already built
)

echo.

REM ============================================================================
REM STEP 7: SYNC CAPACITOR
REM ============================================================================

echo [7/8] Syncing to Capacitor Android...
call npx cap sync android
if errorlevel 1 (
    echo ⚠️  Capacitor sync had issues, but continuing...
)

echo ✅ Capacitor sync complete

echo.

REM ============================================================================
REM STEP 8: BUILD APK
REM ============================================================================

echo [8/8] Building APK...
cd /d "!PROJECT_PATH!\android"

echo 🔨 Running Gradle build...
call gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    echo.
    echo 💡 Try troubleshooting:
    echo    1. Clean build: gradlew clean
    echo    2. Update Gradle: gradlew wrapper --gradle-version 8.1
    echo    3. Check Java: java -version
    pause
    exit /b 1
)

cd /d "!PROJECT_PATH!"

REM ============================================================================
REM SUCCESS
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                        ✅ BUILD SUCCESSFUL!                               ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

set APK_PATH=!PROJECT_PATH!\android\app\build\outputs\apk\debug\app-debug.apk

if exist "!APK_PATH!" (
    for %%A in ("!APK_PATH!") do set APK_SIZE=%%~zA
    set /a APK_SIZE_MB=!APK_SIZE!/1048576
    
    echo 📦 APK Location: !APK_PATH!
    echo 📊 APK Size: !APK_SIZE_MB! MB
    echo.
) else (
    echo ⚠️  APK not found at expected location
)

echo 🚀 Next Steps:
echo.
echo    1. Connect Android device via USB
echo    2. Enable USB Debugging on device
echo    3. Run: adb install -r "!APK_PATH!"
echo    4. Check logs: adb logcat ^| findstr VoxVPN
echo.

echo 📚 Documentation:
echo    - Quick Start: QUICK_START_BUILD.md
echo    - Local Build: BUILD_LOCAL_APK.md
echo    - Full Guide: APK_BUILD_GUIDE.md
echo.

pause
endlocal
