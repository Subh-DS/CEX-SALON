<#
.SYNOPSIS
  Run the full Blush Studio app (FastAPI backend + Vite frontend) on Windows.

.DESCRIPTION
  - Backend  : backend/.venv (created if missing) + pip install -r requirements.txt,
               `alembic upgrade head` (skipped gracefully if it fails, e.g. no DB),
               then `uvicorn app.main:app --reload --port 8000` in its own window.
               If the venv interpreter is blocked on this machine (e.g. by an
               Application Control policy), the script falls back to system python.
  - Frontend : `npm install` (only if node_modules is missing), then `npm run dev`
               in its own window (Vite on http://localhost:5173, proxies /api -> :8000).

.EXAMPLE
  .\run-all.ps1
  .\run-all.ps1 -SkipInstall          # reuse existing .venv / node_modules, fastest restart
  .\run-all.ps1 -BackendPort 8001 -FrontendPort 5174
  .\run-all.ps1 -NoBrowser            # don't auto-open the browser
#>
[CmdletBinding()]
param(
  [switch]$SkipInstall,
  [switch]$SkipMigrations,
  [switch]$NoBrowser,
  [int]$BackendPort = 8000,
  [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Get-Location).Path }
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

function Write-Step([string]$msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-WarnSafe([string]$msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow }

function Test-PythonRuns([string]$exe) {
  try {
    & $exe -c "exit 0" 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

# Modules the backend needs at import time (kept in sync with requirements.txt).
$RequiredModules = @("fastapi", "uvicorn", "sqlalchemy", "aiosqlite", "alembic", "bcrypt", "jwt")

function Test-BackendDeps([string]$py) {
  $code = "import " + ($RequiredModules -join ", ")
  try {
    & $py -c $code 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

if (-not (Test-Path $BackendDir)) { throw "Backend folder not found: $BackendDir" }
if (-not (Test-Path $FrontendDir)) { throw "Frontend folder not found: $FrontendDir" }
foreach ($cmd in @("python", "node", "npm")) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { throw "Required command '$cmd' not found on PATH. Install it first." }
}

# --- Backend interpreter: prefer the venv, fall back to system python ---
# NOTE: on machines where executables under this repo are blocked by policy,
# a venv cannot run, so we go straight to system python (no venv created).
Write-Step "Backend: checking Python interpreter"
$VenvPython = Join-Path $BackendDir ".venv\Scripts\python.exe"
$BackendPython = $null

if ((Test-Path $VenvPython) -and (Test-PythonRuns $VenvPython)) {
  $BackendPython = $VenvPython
  Write-Host "Backend python: $BackendPython (venv)"
} else {
  if (Test-Path $VenvPython) {
    Write-WarnSafe "backend/.venv exists but its python.exe cannot run here (blocked by policy?). Using system python."
  }
  $BackendPython = "python"
  Write-Host "Backend python: $BackendPython (system)"
}

# --- Backend dependencies (preflight so failures surface HERE, not in a flashing window) ---
if (-not $SkipInstall) {
  Write-Step "Backend: pip install -r requirements.txt"
  & $BackendPython -m pip install --upgrade pip
  & $BackendPython -m pip install -r (Join-Path $BackendDir "requirements.txt")
} else {
  Write-Host "Skipping backend pip install (-SkipInstall)."
}

if (-not (Test-BackendDeps $BackendPython)) {
  throw ("Backend dependencies are missing for '$BackendPython' (tried: {0}). " -f ($RequiredModules -join ", ")) +
    "Re-run without -SkipInstall so they get installed, or run: python -m pip install -r backend/requirements.txt"
}
Write-Host "Backend dependencies OK."

if (-not $SkipMigrations -and (Test-Path (Join-Path $BackendDir "alembic.ini"))) {
  Write-Step "Backend: alembic upgrade head"
  try {
    Push-Location $BackendDir
    & $BackendPython -m alembic upgrade head
  } catch {
    Write-WarnSafe "Alembic migration failed, continuing anyway (SQLite dev DB fallback): $($_.Exception.Message)"
  } finally {
    Pop-Location
  }
} else {
  Write-Host "Skipping migrations."
}

# --- Frontend install ---
if (-not $SkipInstall) {
  if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Step "Frontend: npm install"
    Push-Location $FrontendDir
    try { & npm install } finally { Pop-Location }
  } else {
    Write-Host "Frontend node_modules already present, skipping npm install."
  }
} else {
  Write-Host "Skipping frontend npm install (-SkipInstall)."
}

# --- Launch both in their own windows ---
Write-Step "Starting backend (uvicorn) on http://localhost:$BackendPort"
$backendCmd = "cd '$BackendDir'; & '$BackendPython' -m uvicorn app.main:app --reload --port $BackendPort"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WorkingDirectory $BackendDir

Write-Step "Starting frontend (vite dev) on http://localhost:$FrontendPort"
$frontendCmd = "cd '$FrontendDir'; & npm run dev -- --port $FrontendPort"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WorkingDirectory $FrontendDir

Write-Host ""
Write-Host "Backend:  http://localhost:$BackendPort/health  (docs: http://localhost:$BackendPort/docs)" -ForegroundColor Green
Write-Host "Frontend: http://localhost:$FrontendPort" -ForegroundColor Green
Write-Host "Tip: .\run-all.ps1 -SkipInstall  for the fastest restart." -ForegroundColor DarkGray

if (-not $NoBrowser) {
  Write-Step "Waiting for backend health, then opening browser"
  $healthUrl = "http://localhost:$BackendPort/health"
  $deadline = (Get-Date).AddSeconds(60)
  $backendUp = $false
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3
      if ($r.StatusCode -eq 200) { $backendUp = $true; break }
    } catch { Start-Sleep -Seconds 2 }
  }
  if (-not $backendUp) { Write-WarnSafe "Backend did not answer $healthUrl within 60s; opening frontend anyway." }
  Start-Process "http://localhost:$FrontendPort"
}
