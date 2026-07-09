@echo off
mode con cols=60 lines=20
title Coblos Online - Stop All
echo.
echo   ================================================
echo     COBLOS ONLINE - Stop All Services
echo   ================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop_all.ps1"
echo.
pause
