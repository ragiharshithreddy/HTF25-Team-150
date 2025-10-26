# Project Enrollment & Allocation System - Quick Start Script
# Run this script in PowerShell

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Project Allocation System Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found! Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose not found!" -ForegroundColor Red
    exit 1
}

# Check if .env exists
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "✓ Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠ IMPORTANT: Edit .env file with your configuration!" -ForegroundColor Red
    Write-Host "  Required: Email credentials, JWT secret, etc." -ForegroundColor Yellow
    
    $editNow = Read-Host "Do you want to edit .env now? (y/n)"
    if ($editNow -eq "y") {
        notepad .env
    }
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Start Docker Desktop if not running
Write-Host ""
Write-Host "Starting Docker services..." -ForegroundColor Yellow

$continue = Read-Host "Ready to build and start the application? (y/n)"
if ($continue -ne "y") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

# Build and start containers
Write-Host ""
Write-Host "Building Docker images (this may take a few minutes)..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "✓ Application Started Successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application at:" -ForegroundColor Cyan
    Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
    Write-Host "  API Health: http://localhost:5000/api/health" -ForegroundColor White
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "Stop application:" -ForegroundColor Yellow
    Write-Host "  docker-compose down" -ForegroundColor White
    Write-Host ""
    
    $openBrowser = Read-Host "Open in browser? (y/n)"
    if ($openBrowser -eq "y") {
        Start-Process "http://localhost:3000"
    }
} else {
    Write-Host ""
    Write-Host "✗ Error starting application!" -ForegroundColor Red
    Write-Host "Check the logs with: docker-compose logs" -ForegroundColor Yellow
}
