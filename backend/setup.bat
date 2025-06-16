@echo off
echo ===========================================
echo     HRMS Backend Quick Setup Script
echo ===========================================
echo.

echo Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running.
    echo Please install Docker Desktop and make sure it's running.
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker is available

echo.
echo Starting PostgreSQL database...
docker-compose up -d postgres

echo.
echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Installing dependencies...
npm install

echo.
echo Generating Prisma client...
npx prisma generate

echo.
echo Running database migrations...
npx prisma db push

echo.
echo Seeding database with sample data...
npm run seed

echo.
echo ✅ Setup completed!
echo.
echo 📧 Default credentials:
echo    Admin: admin@hrms.com / admin123
echo    Employee: john.doe@hrms.com / password123
echo.
echo To start the backend server, run:
echo    npm run dev
echo.
pause
