@echo off
title Coblos Online - Domain Tunnel
echo.
echo   ========================================
echo     COBLOS ONLINE - Domain Tunnel Runner
echo     osisvote.codeteacher.full.diskon.cloud
echo   ========================================
echo.
echo   Starting domain tunnel... Please wait.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tunnel_domain.ps1"
pause
