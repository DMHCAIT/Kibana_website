@echo off
echo ========================================
echo Kibana Website - Clean Build Script
echo ========================================
echo.

echo [1/5] Removing .next folder...
if exist .next (
  rmdir /s /q .next
  echo ✓ .next folder removed
) else (
  echo ✓ .next folder already clean
)
echo.

echo [2/5] Clearing npm cache...
call npm cache clean --force
echo ✓ npm cache cleared
echo.

echo [3/5] Installing dependencies...
call npm install
echo ✓ Dependencies installed
echo.

echo [4/5] Building project...
call npm run build
echo ✓ Project built successfully
echo.

echo [5/5] Starting dev server...
call npm run dev
echo.
echo ========================================
echo Build complete! Server running...
echo Visit: http://localhost:3000
echo ========================================
pause
