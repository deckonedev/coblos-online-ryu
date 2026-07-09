@echo off
echo 🚀 Starting Coblos Online...
start powershell -NoExit -Command "cd backend; php artisan serve"
start powershell -NoExit -Command "cd frontend; npm run dev"
echo ✅ Both servers are starting in new windows!
pause
