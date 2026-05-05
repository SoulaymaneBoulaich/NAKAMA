# NAKAMA — Developer Onboarding (Windows)
# Run once after cloning the repo in PowerShell.

Write-Host "`n=== NAKAMA Dev Environment Setup ===" -ForegroundColor Cyan

# 1. Check prerequisites
foreach ($cmd in @("docker", "node", "npm")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: '$cmd' not found. Install it first." -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Prerequisites verified" -ForegroundColor Green

# 2. Create .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] Created .env from template — edit credentials now" -ForegroundColor Green
} else {
    Write-Host "[OK] .env already exists" -ForegroundColor Green
}

# 3. Start DB
Write-Host "Starting database container..." -ForegroundColor Cyan
docker compose up -d --wait
Write-Host "[OK] Database healthy" -ForegroundColor Green

# 4. Install deps
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# 5. Prisma sync
Write-Host "Syncing Prisma schema..." -ForegroundColor Cyan
Set-Location server
npx prisma generate
npx prisma db push --accept-data-loss
Write-Host "[OK] Schema synchronized" -ForegroundColor Green

# 6. Optional seed
$seed = Read-Host "Seed database? (y/N)"
if ($seed -eq "y") {
    npx tsx prisma/seed.ts
    Write-Host "[OK] Seeded" -ForegroundColor Green
}

Set-Location ..
Write-Host "`n=== Setup complete! Run: npm run dev ===" -ForegroundColor Green
