@echo off
mode con cols=100 lines=30
title Coblos Online - Public Tunnel
echo.
echo   ========================================
echo     COBLOS ONLINE - Public Tunnel Runner
echo     Powered by Cloudflare Quick Tunnel
echo   ========================================
echo.
echo   Starting tunnel... Please wait.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tunnel_public.ps1"
pause
