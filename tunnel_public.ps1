<#
  ==============================================================
          COBLOS ONLINE - Public Tunnel Auto-Runner           
     Expose your local app to the internet via Cloudflare     
               No hosting required! 100% Free!                
  ==============================================================

  Prerequisites:
  - PHP & Composer installed
  - Node.js & npm installed
  - MySQL running locally with 'coblos_online' database
  - cloudflared.exe will be auto-downloaded if not found
#>

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

# ============ SET WINDOW SIZE & TITLE ============
try {
    $Host.UI.RawUI.WindowTitle = "COBLOS ONLINE - Tunnel Runner"
    $maxW = $Host.UI.RawUI.MaxPhysicalWindowSize.Width
    $maxH = $Host.UI.RawUI.MaxPhysicalWindowSize.Height
    $w = [Math]::Min(100, $maxW)
    $h = [Math]::Min(30, $maxH)
    $buf = $Host.UI.RawUI.BufferSize
    if ($buf.Width -lt $w) { $buf.Width = $w }
    $Host.UI.RawUI.BufferSize = $buf
    $Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size($w, $h)
} catch {}

# =================== CONFIG ===================
$BACKEND_PORT  = 8000
$FRONTEND_PORT = 5173
$PROJECT_ROOT  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BACKEND_DIR   = Join-Path $PROJECT_ROOT "backend"
$FRONTEND_DIR  = Join-Path $PROJECT_ROOT "frontend"
$LOG_DIR       = Join-Path $PROJECT_ROOT ".tunnel-logs"
$CLOUDFLARED   = Join-Path $PROJECT_ROOT "cloudflared.exe"

# Webhook config - auto update domain proxy
$WEBHOOK_DOMAIN  = "pilkasis.deckonecode.my.id"
$WEBHOOK_URL     = "https://$WEBHOOK_DOMAIN/webhook.php"
$WEBHOOK_SECRET  = "coblos-osis-2026"
# ================================================

# Create log directory
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

function Write-Banner {
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Cyan
    Write-Host "    COBLOS ONLINE - Public Tunnel Runner          " -ForegroundColor Cyan
    Write-Host "    Powered by Cloudflare Quick Tunnel            " -ForegroundColor Cyan
    Write-Host "  ================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host "  -> $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "  [ERR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [INFO] $Message" -ForegroundColor DarkCyan
}

function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Get-CloudflaredPath {
    # Check global command first
    if (Test-CommandExists "cloudflared") {
        return "cloudflared"
    }
    # Check local exe
    if (Test-Path $CLOUDFLARED) {
        return $CLOUDFLARED
    }
    return $null
}

function Stop-AllProcesses {
    Write-Host ""
    Write-Step "Shutting down all processes..." "Red"

    # Kill cloudflared tunnels
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    # Kill PHP artisan serve on our port
    $phpProcs = Get-NetTCPConnection -LocalPort $BACKEND_PORT -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $phpProcs) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    # Kill node/vite dev server on our port
    $nodeProcs = Get-NetTCPConnection -LocalPort $FRONTEND_PORT -ErrorAction SilentlyContinue |
                 Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $nodeProcs) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }

    Write-Success "All processes stopped."
}

function Get-TunnelUrl {
    param(
        [string]$LogFile,
        [int]$TimeoutSeconds = 30
    )

    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-Path $LogFile) {
            $content = Get-Content $LogFile -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Match the trycloudflare.com URL from cloudflared output
                $match = [regex]::Match($content, 'https://[a-zA-Z0-9\-]+\.trycloudflare\.com')
                if ($match.Success) {
                    return $match.Value
                }
            }
        }
        Start-Sleep -Milliseconds 500
        $elapsed++
    }
    return $null
}

# ======================== MAIN ========================

Write-Banner

# Check prerequisites
Write-Step "Checking prerequisites..."

$prereqsFailed = $false

# Check cloudflared - auto download if missing
$cfPath = Get-CloudflaredPath
if (-not $cfPath) {
    Write-Info "cloudflared not found. Downloading automatically..."
    try {
        Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" `
            -OutFile $CLOUDFLARED -UseBasicParsing
        $cfPath = $CLOUDFLARED
        Write-Success "cloudflared downloaded successfully!"
    } catch {
        Write-Error-Custom "Failed to download cloudflared."
        Write-Host "         Manual download: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Gray
        $prereqsFailed = $true
    }
} else {
    Write-Success "cloudflared found: $cfPath"
}

if (-not (Test-CommandExists "php")) {
    Write-Error-Custom "PHP not found! Please install PHP and add to PATH."
    $prereqsFailed = $true
}

if (-not (Test-CommandExists "node")) {
    Write-Error-Custom "Node.js not found! Please install Node.js."
    $prereqsFailed = $true
}

if ($prereqsFailed) {
    Write-Host ""
    Write-Error-Custom "Please install the missing prerequisites and try again."
    exit 1
}

Write-Success "All prerequisites found!"

# Save original .env for restore later
$backendEnvPath = Join-Path $BACKEND_DIR ".env"
$backendEnvOriginal = Get-Content $backendEnvPath -Raw
$frontendEnvPath = Join-Path $FRONTEND_DIR ".env"
$frontendEnvOriginal = Get-Content $frontendEnvPath -Raw

try {
    # ==================== STEP 1: Start Backend ====================
    if (-not $SkipBackend) {
        Write-Host ""
        Write-Step "Starting Laravel Backend on port $BACKEND_PORT..." "Green"

        $backendLog = Join-Path $LOG_DIR "backend.log"
        $backendProc = Start-Process -FilePath "php" `
            -ArgumentList "artisan", "serve", "--host=127.0.0.1", "--port=$BACKEND_PORT" `
            -WorkingDirectory $BACKEND_DIR `
            -RedirectStandardOutput $backendLog `
            -RedirectStandardError (Join-Path $LOG_DIR "backend-error.log") `
            -PassThru -WindowStyle Hidden

        Start-Sleep -Seconds 3

        # Check if backend started
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:$BACKEND_PORT/up" -UseBasicParsing -TimeoutSec 5
            Write-Success "Backend running on http://127.0.0.1:$BACKEND_PORT"
        } catch {
            Write-Error-Custom "Backend failed to start. Check $backendLog for errors."
            Write-Info "Make sure MySQL is running and database 'coblos_online' exists."
            exit 1
        }
    }

    # ==================== STEP 2: Create Backend Tunnel ====================
    Write-Host ""
    Write-Step "Creating Cloudflare tunnel for Backend..." "Magenta"

    $backendTunnelLog = Join-Path $LOG_DIR "tunnel-backend.log"
    if (Test-Path $backendTunnelLog) { 
        Remove-Item $backendTunnelLog -Force -ErrorAction SilentlyContinue 
        if (Test-Path $backendTunnelLog) { Clear-Content $backendTunnelLog -Force -ErrorAction SilentlyContinue }
    }

    $backendTunnel = Start-Process -FilePath $cfPath `
        -ArgumentList "tunnel", "--url", "http://127.0.0.1:$BACKEND_PORT" `
        -RedirectStandardOutput (Join-Path $LOG_DIR "tunnel-backend-stdout.log") `
        -RedirectStandardError $backendTunnelLog `
        -PassThru -WindowStyle Hidden

    Write-Info "Waiting for backend tunnel URL..."
    $backendUrl = Get-TunnelUrl -LogFile $backendTunnelLog -TimeoutSeconds 30

    if (-not $backendUrl) {
        Write-Error-Custom "Failed to get backend tunnel URL. Check logs at $backendTunnelLog"
        exit 1
    }

    Write-Success "Backend Tunnel: $backendUrl"

    # ==================== STEP 3: Update Frontend .env ====================
    Write-Host ""
    Write-Step "Updating Frontend .env to point to tunnel backend..." "Yellow"

    # Overwrite frontend .env with the tunnel API URL
    @"
# Auto-generated by tunnel_public.ps1 - Original will be restored on exit
VITE_API_URL=$backendUrl/api
"@ | Set-Content -Path $frontendEnvPath -Encoding UTF8

    Write-Success "Frontend .env updated: VITE_API_URL=$backendUrl/api"

    # ==================== STEP 4: Update Backend CORS ====================
    Write-Host ""
    Write-Step "Preparing Backend CORS for tunnel (placeholder)..." "Yellow"

    # Add CORS placeholder - will be finalized after frontend tunnel URL is known
    $backendEnvContent = $backendEnvOriginal.TrimEnd()
    # Remove existing tunnel overrides if any
    $backendEnvContent = $backendEnvContent -replace "(?m)^# Tunnel Override.*\r?\n?", ""
    $backendEnvContent = $backendEnvContent -replace "(?m)^CORS_ALLOWED_ORIGINS=.*\r?\n?", ""
    $backendEnvContent = $backendEnvContent -replace "(?m)^SANCTUM_STATEFUL_DOMAINS=.*\r?\n?", ""
    $backendEnvContent = $backendEnvContent -replace "(?m)^SESSION_DOMAIN=.*\r?\n?", ""
    $backendEnvContent = $backendEnvContent.TrimEnd()
    $backendEnvContent += "`n`n# Tunnel Override`nCORS_ALLOWED_ORIGINS=PLACEHOLDER_FRONTEND_URL,http://localhost:5173,http://127.0.0.1:5173`n"

    Set-Content -Path $backendEnvPath -Value $backendEnvContent -Encoding UTF8 -NoNewline

    Write-Info "CORS will be finalized after frontend tunnel is created..."

    # ==================== STEP 5: Start Frontend ====================
    if (-not $SkipFrontend) {
        Write-Host ""
        Write-Step "Starting Vite Frontend on port $FRONTEND_PORT..." "Green"

        $frontendLog = Join-Path $LOG_DIR "frontend.log"

        # Start Vite dev server - it will read .env automatically
        $frontendProc = Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/c", "npx vite --host 0.0.0.0 --port $FRONTEND_PORT" `
            -WorkingDirectory $FRONTEND_DIR `
            -RedirectStandardOutput $frontendLog `
            -RedirectStandardError (Join-Path $LOG_DIR "frontend-error.log") `
            -PassThru -WindowStyle Hidden

        Start-Sleep -Seconds 6

        # Check if frontend started
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:$FRONTEND_PORT" -UseBasicParsing -TimeoutSec 10
            Write-Success "Frontend running on http://127.0.0.1:$FRONTEND_PORT"
        } catch {
            Write-Info "Frontend may still be starting... continuing with tunnel setup."
        }
    }

    # ==================== STEP 6: Create Frontend Tunnel ====================
    Write-Host ""
    Write-Step "Creating Cloudflare tunnel for Frontend..." "Magenta"

    $frontendTunnelLog = Join-Path $LOG_DIR "tunnel-frontend.log"
    if (Test-Path $frontendTunnelLog) { 
        Remove-Item $frontendTunnelLog -Force -ErrorAction SilentlyContinue 
        if (Test-Path $frontendTunnelLog) { Clear-Content $frontendTunnelLog -Force -ErrorAction SilentlyContinue }
    }

    $frontendTunnel = Start-Process -FilePath $cfPath `
        -ArgumentList "tunnel", "--url", "http://127.0.0.1:$FRONTEND_PORT" `
        -RedirectStandardOutput (Join-Path $LOG_DIR "tunnel-frontend-stdout.log") `
        -RedirectStandardError $frontendTunnelLog `
        -PassThru -WindowStyle Hidden

    Write-Info "Waiting for frontend tunnel URL..."
    $frontendUrl = Get-TunnelUrl -LogFile $frontendTunnelLog -TimeoutSeconds 30

    if (-not $frontendUrl) {
        Write-Error-Custom "Failed to get frontend tunnel URL. Check logs at $frontendTunnelLog"
        exit 1
    }

    Write-Success "Frontend Tunnel: $frontendUrl"

    # ==================== STEP 7: Finalize CORS + Restart Backend ====================
    Write-Host ""
    Write-Step "Finalizing Backend CORS with frontend tunnel URL..." "Yellow"

    $backendEnvContent = Get-Content $backendEnvPath -Raw
    $backendEnvContent = $backendEnvContent -replace "PLACEHOLDER_FRONTEND_URL", $frontendUrl

    # Extract domains for Sanctum
    $frontendDomain = ([System.Uri]$frontendUrl).Host
    $backendDomain = ([System.Uri]$backendUrl).Host

    $backendEnvContent = $backendEnvContent.TrimEnd()
    $backendEnvContent += "`nSANCTUM_STATEFUL_DOMAINS=$frontendDomain,$backendDomain,localhost,127.0.0.1`n"
    $backendEnvContent += "SESSION_DOMAIN=.trycloudflare.com`n"

    Set-Content -Path $backendEnvPath -Value $backendEnvContent -Encoding UTF8 -NoNewline

    # Restart backend to pick up new CORS settings
    Write-Info "Restarting backend to apply CORS changes..."
    if ($backendProc -and -not $backendProc.HasExited) {
        $backendProc | Stop-Process -Force
        Start-Sleep -Seconds 1
    }
    # Kill any remaining PHP process on the port
    $phpProcs = Get-NetTCPConnection -LocalPort $BACKEND_PORT -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $phpProcs) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1

    # Clear Laravel config cache first
    Start-Process -FilePath "php" -ArgumentList "artisan", "config:clear" `
        -WorkingDirectory $BACKEND_DIR -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue

    $backendProc = Start-Process -FilePath "php" `
        -ArgumentList "artisan", "serve", "--host=127.0.0.1", "--port=$BACKEND_PORT" `
        -WorkingDirectory $BACKEND_DIR `
        -RedirectStandardOutput (Join-Path $LOG_DIR "backend-restart.log") `
        -RedirectStandardError (Join-Path $LOG_DIR "backend-restart-error.log") `
        -PassThru -WindowStyle Hidden

    Start-Sleep -Seconds 2
    Write-Success "Backend restarted with updated CORS"

    # ==================== STEP 8: Webhook to Domain ====================
    Write-Host ""
    Write-Step "Sending webhook to update domain proxy..." "Magenta"

    $webhookSuccess = $false
    try {
        $webhookBody = @{
            secret       = $WEBHOOK_SECRET
            frontend_url = $frontendUrl
            backend_url  = $backendUrl
        } | ConvertTo-Json

        $webhookResponse = Invoke-RestMethod -Uri $WEBHOOK_URL `
            -Method POST `
            -Body $webhookBody `
            -ContentType "application/json" `
            -TimeoutSec 10

        if ($webhookResponse.status -eq "ok") {
            Write-Success "Domain proxy updated! https://$WEBHOOK_DOMAIN"
            $webhookSuccess = $true
        } else {
            Write-Info "Webhook response: $($webhookResponse | ConvertTo-Json -Compress)"
        }
    } catch {
        Write-Info "Webhook gagal (domain hosting mungkin belum di-setup)."
        Write-Info "Upload folder 'hosting/' ke $WEBHOOK_DOMAIN untuk mengaktifkan."
    }

    # ==================== ALL DONE ====================
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Green
    Write-Host "         ALL SYSTEMS ARE LIVE!                    " -ForegroundColor Green
    Write-Host "  ================================================" -ForegroundColor Green
    Write-Host ""
    if ($webhookSuccess) {
        Write-Host "  [DOMAIN - Share this!]" -ForegroundColor Cyan
        Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
        Write-Host "  https://$WEBHOOK_DOMAIN" -ForegroundColor White
        Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
        Write-Host ""
    }
    Write-Host "  [TUNNEL URLs]" -ForegroundColor Cyan
    Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Frontend : $frontendUrl" -ForegroundColor White
    Write-Host "  Backend  : $backendUrl" -ForegroundColor White
    Write-Host "  API      : $backendUrl/api" -ForegroundColor White
    Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  [LOCAL]" -ForegroundColor Cyan
    Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Frontend : http://127.0.0.1:$FRONTEND_PORT" -ForegroundColor DarkGray
    Write-Host "  Backend  : http://127.0.0.1:$BACKEND_PORT" -ForegroundColor DarkGray
    Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  [Logs]: $LOG_DIR" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  [!] Tekan Ctrl+C untuk stop." -ForegroundColor Yellow
    Write-Host ""

    # Save URL info to a file for easy reference
    $urlInfoPath = Join-Path $PROJECT_ROOT "TUNNEL_URLS.txt"
    @"
COBLOS ONLINE - Tunnel URLs
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
================================================

DOMAIN (share this!):
  https://$WEBHOOK_DOMAIN

FRONTEND (direct tunnel):
  $frontendUrl

BACKEND API:
  $backendUrl/api

LOCAL:
  Frontend: http://127.0.0.1:$FRONTEND_PORT
  Backend:  http://127.0.0.1:$BACKEND_PORT

================================================
"@ | Set-Content -Path $urlInfoPath -Encoding UTF8
    Write-Info "URLs saved to TUNNEL_URLS.txt"
    Write-Host ""

    # Keep the script running with health checks
    Write-Host "  Press Ctrl+C to stop..." -ForegroundColor DarkGray
    Write-Host ""

    while ($true) {
        Start-Sleep -Seconds 10

        # Health check backend
        $backendAlive = $false
        try {
            $null = Invoke-WebRequest -Uri "http://127.0.0.1:$BACKEND_PORT/up" -UseBasicParsing -TimeoutSec 3
            $backendAlive = $true
        } catch {}

        if (-not $backendAlive -and -not $SkipBackend) {
            Write-Step "Backend down! Auto-restarting..." "Red"
            $backendProc = Start-Process -FilePath "php" `
                -ArgumentList "artisan", "serve", "--host=127.0.0.1", "--port=$BACKEND_PORT" `
                -WorkingDirectory $BACKEND_DIR `
                -RedirectStandardOutput (Join-Path $LOG_DIR "backend-auto-restart.log") `
                -RedirectStandardError (Join-Path $LOG_DIR "backend-auto-restart-error.log") `
                -PassThru -WindowStyle Hidden
            Write-Success "Backend restarted!"
        }

        # Check if cloudflared tunnels are still running
        $tunnelProcs = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if (-not $tunnelProcs) {
            Write-Error-Custom "Cloudflare tunnels have died! Please restart the script."
            break
        }
    }
} finally {
    # Cleanup - restore original .env files
    Write-Host ""
    Write-Step "Cleaning up & restoring original .env files..." "Yellow"

    # Restore original backend .env
    Set-Content -Path $backendEnvPath -Value $backendEnvOriginal -Encoding UTF8 -NoNewline

    # Restore original frontend .env
    Set-Content -Path $frontendEnvPath -Value $frontendEnvOriginal -Encoding UTF8 -NoNewline

    # Clear Laravel config cache
    Start-Process -FilePath "php" -ArgumentList "artisan", "config:clear" `
        -WorkingDirectory $BACKEND_DIR -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue

    # Remove tunnel .env if exists
    $tunnelEnvPath = Join-Path $FRONTEND_DIR ".env.tunnel"
    if (Test-Path $tunnelEnvPath) { Remove-Item $tunnelEnvPath -Force -ErrorAction SilentlyContinue }

    Stop-AllProcesses
    Write-Success "Cleanup complete. Original .env files restored."
    Write-Host ""
}
