@echo off
title Coblos Online - Domain Tunnel Setup
echo.
echo   ========================================
echo     COBLOS ONLINE - Domain Tunnel Setup
echo     One-time setup for permanent URL
echo   ========================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_domain_tunnel.ps1"
