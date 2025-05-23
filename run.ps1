# PowerShell script to run both Next.js client and WebSocket server

Write-Host "Starting Watch Together Application..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check if Node.js is installed
if (-not (Test-Command "node")) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Test-Command "npm")) {
    Write-Host "Error: npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
Write-Host "Checking and installing dependencies..." -ForegroundColor Yellow

# Install server dependencies
if (Test-Path "server/package.json") {
    Set-Location "server"
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing server dependencies..." -ForegroundColor Yellow
        npm install
    }
    Set-Location ".."
} else {
    Write-Host "Warning: server/package.json not found" -ForegroundColor Yellow
}

# Install client dependencies
if (Test-Path "client/package.json") {
    Set-Location "client"
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing client dependencies..." -ForegroundColor Yellow
        npm install
    }
    Set-Location ".."
} else {
    Write-Host "Warning: client/package.json not found" -ForegroundColor Yellow
}

# Start the applications
Write-Host "Starting WebSocket server and Next.js client..." -ForegroundColor Green

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "server"
    npm run start
}

# Wait a moment for server to start
Start-Sleep -Seconds 2

# Start client in background
$clientJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "client"
    npm run dev
}

Write-Host "Applications are starting..." -ForegroundColor Green
Write-Host "Server: WebSocket server on ws://localhost:8080" -ForegroundColor Cyan
Write-Host "Client: Next.js app on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both applications" -ForegroundColor Yellow

# Wait for user input to stop
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Clean up jobs when script is interrupted
    Write-Host "`nStopping applications..." -ForegroundColor Yellow
    Stop-Job $serverJob, $clientJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob, $clientJob -ErrorAction SilentlyContinue
    Write-Host "Applications stopped." -ForegroundColor Green
}