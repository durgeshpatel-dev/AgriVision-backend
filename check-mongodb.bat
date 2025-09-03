@echo off
echo.
echo ========================================
echo    AgriVision MongoDB Setup Checker
echo ========================================
echo.

REM Check if MongoDB is installed
echo [1/4] Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is installed
    mongod --version
) else (
    echo ❌ MongoDB is NOT installed
    echo.
    echo Please install MongoDB Community Server:
    echo 1. Go to: https://www.mongodb.com/try/download/community
    echo 2. Download Windows MSI installer
    echo 3. Run installer and check "Install MongoDB Compass"
    echo 4. Run this script again after installation
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Checking MongoDB service status...
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB service exists
    for /f "tokens=3" %%i in ('sc query MongoDB ^| findstr STATE') do set state=%%i
    if "!state!"=="RUNNING" (
        echo ✅ MongoDB service is RUNNING
    ) else (
        echo ⚠️ MongoDB service is not running. Starting...
        net start MongoDB
        if %errorlevel% equ 0 (
            echo ✅ MongoDB service started successfully
        ) else (
            echo ❌ Failed to start MongoDB service
        )
    )
) else (
    echo ❌ MongoDB service not found
    echo Please reinstall MongoDB with "Install as Service" option checked
)

echo.
echo [3/4] Checking if port 27017 is available...
netstat -an | findstr :27017 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Port 27017 is in use (MongoDB is listening)
) else (
    echo ⚠️ Port 27017 is not in use
    echo MongoDB might not be running properly
)

echo.
echo [4/4] Testing MongoDB connection...
timeout /t 2 /nobreak >nul
mongo --eval "db.adminCommand('ismaster')" --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB connection successful
) else (
    echo ⚠️ MongoDB connection test failed
    echo Trying alternative connection method...
    mongosh --eval "db.adminCommand('ismaster')" --quiet >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ MongoDB connection successful (using mongosh)
    ) else (
        echo ❌ Unable to connect to MongoDB
    )
)

echo.
echo ========================================
echo           Setup Summary
echo ========================================
echo.
echo MongoDB Installation: Check the status above
echo Service Status: Check if running
echo Connection: Check if successful
echo.
echo If all checks passed, you can now:
echo 1. Open MongoDB Compass
echo 2. Connect to: mongodb://localhost:27017
echo 3. Create database: agrivision
echo 4. Start your AgriVision backend server
echo.
echo If any checks failed, please follow the MongoDB Setup Guide.
echo.
pause
