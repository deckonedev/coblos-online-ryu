<#
  COBLOS ONLINE - Stop All Services
  Menghentikan semua proses: PHP, Node, Cloudflared
#>

try {
    $Host.UI.RawUI.WindowTitle = "COBLOS ONLINE - Stop All"
} catch {}

function Write-Status {
    param([string]$Name, [bool]$Found)
    if ($Found) {
        Write-Host "  [OK] $Name dihentikan." -ForegroundColor Green
    } else {
        Write-Host "  [--] $Name tidak sedang berjalan." -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Red
Write-Host "    COBLOS ONLINE - Menghentikan Semua Service    " -ForegroundColor Red
Write-Host "  ================================================" -ForegroundColor Red
Write-Host ""

# 1. Stop PHP (Laravel Backend)
$php = Get-Process -Name "php" -ErrorAction SilentlyContinue
if ($php) {
    $php | Stop-Process -Force
    Write-Status "PHP / Laravel Backend" $true
} else {
    Write-Status "PHP / Laravel Backend" $false
}

# 2. Stop Node (Vite Frontend)
$node = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($node) {
    $node | Stop-Process -Force
    Write-Status "Node / Vite Frontend" $true
} else {
    Write-Status "Node / Vite Frontend" $false
}

# 3. Stop Cloudflared (Tunnel)
$cf = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cf) {
    $cf | Stop-Process -Force
    Write-Status "Cloudflared Tunnel" $true
} else {
    Write-Status "Cloudflared Tunnel" $false
}

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "    Semua service sudah dihentikan!               " -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""
