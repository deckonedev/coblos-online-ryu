# Start Coblos Online Fullstack Application

Write-Host "🚀 Starting Coblos Online..." -ForegroundColor Cyan

# 1. Start Backend (Laravel)
Write-Host "📦 Starting Backend (Laravel)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; php artisan serve"

# 2. Start Frontend (Vite)
Write-Host "🎨 Starting Frontend (Vite)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ Both servers are starting in new windows!" -ForegroundColor Yellow
Write-Host "Backend: http://127.0.0.1:8000"
Write-Host "Frontend: http://localhost:5173"
