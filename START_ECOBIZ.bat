@echo off
setlocal DisableDelayedExpansion
title EcoBiz - Try the app
set "ECOBIZ_LAUNCHER=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$source=[IO.File]::ReadAllText($env:ECOBIZ_LAUNCHER); $marker='# ECOBIZ POWERSHELL'; & ([scriptblock]::Create($source.Substring($source.LastIndexOf($marker)+$marker.Length)))"
set "ECOBIZ_EXIT=%ERRORLEVEL%"
if not "%ECOBIZ_EXIT%"=="0" pause
exit /b %ECOBIZ_EXIT%
# ECOBIZ POWERSHELL
$ErrorActionPreference = 'Stop'

function Find-EcoPort {
    foreach ($port in 3001..3010) {
        $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $port)
        try { $listener.Start(); return $port } catch [Net.Sockets.SocketException] { } finally { $listener.Stop() }
    }
    throw 'The local demo ports are busy. Close any other EcoBiz windows and try again.'
}

function Get-EcoFileHash($path) {
    $stream = [IO.File]::OpenRead($path)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '') } finally { $sha.Dispose(); $stream.Dispose() }
}

function Expand-EcoRuntime($archive, $expectedHash, $destination) {
    if ((Get-EcoFileHash $archive) -ne $expectedHash) {
        throw 'The Node.js download failed its checksum check. Please try again.'
    }
    Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force
}

function Test-EcoNode($path) {
    if (-not (Test-Path -LiteralPath $path)) { return $false }
    try { $version = & $path --version 2>$null; return $LASTEXITCODE -eq 0 -and $version -match '^v24\.' } catch { return $false }
}

function Get-EcoNode($cache) {
    $installed = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($installed -and (Test-EcoNode $installed.Source) -and (Test-Path -LiteralPath (Join-Path (Split-Path -Parent $installed.Source) 'npm.cmd'))) {
        return (Split-Path -Parent $installed.Source)
    }
    foreach ($folder in @(Get-ChildItem -LiteralPath $cache -Directory -Filter 'node-v24.*-win-*' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending)) {
        if ((Test-EcoNode (Join-Path $folder.FullName 'node.exe')) -and (Test-Path -LiteralPath (Join-Path $folder.FullName 'npm.cmd'))) { return $folder.FullName }
    }
    $architecture = if ($env:PROCESSOR_ARCHITEW6432) { $env:PROCESSOR_ARCHITEW6432 } else { $env:PROCESSOR_ARCHITECTURE }
    $platform = switch ($architecture) { 'AMD64' { 'x64' }; 'ARM64' { 'arm64' }; default { throw 'EcoBiz needs 64-bit Windows (x64 or ARM64).' } }
    Write-Host 'Downloading Node.js 24 for this folder. Nothing is installed system-wide...'
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $checksums = (Invoke-WebRequest -Uri 'https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt' -UseBasicParsing -TimeoutSec 60).Content
    $pattern = '(?m)^([a-f0-9]{64})\s+(node-(v24\.\d+\.\d+)-win-' + $platform + '\.zip)\s*$'
    $match = [regex]::Match($checksums, $pattern)
    if (-not $match.Success) { throw 'The Node.js download information could not be read. Check your internet connection and try again.' }
    $file = $match.Groups[2].Value
    $version = $match.Groups[3].Value
    $archive = Join-Path $cache $file
    Invoke-WebRequest -Uri ('https://nodejs.org/dist/' + $version + '/' + $file) -UseBasicParsing -OutFile $archive -TimeoutSec 180
    Expand-EcoRuntime $archive $match.Groups[1].Value $cache
    $runtime = Join-Path $cache ([IO.Path]::GetFileNameWithoutExtension($file))
    if (-not (Test-EcoNode (Join-Path $runtime 'node.exe'))) { throw 'The downloaded Node.js runtime could not start.' }
    return $runtime
}

function Install-EcoDependencies($app, $nodeDir, $cache) {
    $lockHash = (Get-EcoFileHash (Join-Path $app 'package-lock.json'))
    $stamp = Join-Path $cache 'dependencies.sha256'
    $next = Join-Path $app 'node_modules\next\dist\bin\next'
    if ((Test-Path -LiteralPath $next) -and (Test-Path -LiteralPath $stamp) -and [IO.File]::ReadAllText($stamp).Trim() -eq $lockHash) { return }
    Write-Host 'Preparing EcoBiz dependencies. The first start can take a few minutes...'
    Push-Location -LiteralPath $app
    try {
        & (Join-Path $nodeDir 'npm.cmd') ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'EcoBiz dependencies could not be installed. Check your internet connection, then double-click START_ECOBIZ.bat again.' }
        if (-not (Test-Path -LiteralPath $next)) { throw 'EcoBiz dependencies are incomplete. Please try again.' }
        [IO.File]::WriteAllText($stamp, $lockHash)
    } finally { Pop-Location }
}

function Get-EcoAppFingerprint($app) {
    $files = @(Get-ChildItem -LiteralPath (Join-Path $app 'src'), (Join-Path $app 'public') -File -Recurse)
    $files += @(Get-ChildItem -LiteralPath $app -File | Where-Object { $_.Extension -in @('.json','.ts','.js','.mjs','.cjs') -and $_.Name -ne 'next-env.d.ts' })
    $manifest = ($files | Sort-Object FullName | ForEach-Object { $_.FullName.Substring($app.Length) + ':' + (Get-EcoFileHash $_.FullName) }) -join [Environment]::NewLine
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($manifest))).Replace('-', '') } finally { $sha.Dispose() }
}

function Build-EcoApp($app, $nodeDir, $cache) {
    $fingerprint = Get-EcoAppFingerprint $app
    $stamp = Join-Path $cache 'build.sha256'
    if ((Test-Path -LiteralPath (Join-Path $app '.next\BUILD_ID')) -and (Test-Path -LiteralPath $stamp) -and [IO.File]::ReadAllText($stamp).Trim() -eq $fingerprint) { return }
    Write-Host 'Preparing the latest EcoBiz app. This is automatic and may take a few minutes...'
    Push-Location -LiteralPath $app
    try {
        & (Join-Path $nodeDir 'npm.cmd') run build -- --webpack
        if ($LASTEXITCODE -ne 0) { throw 'The EcoBiz build could not finish. Read the message above, then try again.' }
        if (-not (Test-Path -LiteralPath (Join-Path $app '.next\BUILD_ID'))) { throw 'The EcoBiz build is incomplete. Please try again.' }
        [IO.File]::WriteAllText($stamp, (Get-EcoAppFingerprint $app))
    } finally { Pop-Location }
}

try {
    $root = Split-Path -Parent $env:ECOBIZ_LAUNCHER
    $app = Join-Path $root 'ecobiz-app'
    if (-not (Test-Path -LiteralPath (Join-Path $app 'package-lock.json'))) { throw 'Extract the entire EcoBiz ZIP first. Keep START_ECOBIZ.bat beside the ecobiz-app folder.' }
    $cache = Join-Path $root '.ecobiz'
    New-Item -ItemType Directory -Path $cache -Force | Out-Null
    Write-Host ''
    Write-Host 'EcoBiz - Meals, Fertilizer and Delivery' -ForegroundColor Green
    Write-Host 'Preparing your local demo. No account or payment is needed.'
    Write-Host ''
    $nodeDir = Get-EcoNode $cache
    $env:Path = $nodeDir + ';' + $env:Path
    $env:NEXT_TELEMETRY_DISABLED = '1'
    Install-EcoDependencies $app $nodeDir $cache
    Build-EcoApp $app $nodeDir $cache
    $port = Find-EcoPort
    $env:ECOBIZ_DEMO_URL = 'http://127.0.0.1:' + $port
    Write-Host ''
    Write-Host ('Opening EcoBiz at ' + $env:ECOBIZ_DEMO_URL) -ForegroundColor Green
    Write-Host 'The first page may take a moment to prepare. Your browser opens when it is ready.'
    Write-Host 'Keep this window open while testing. Close it when you are finished.'
    Write-Host 'All orders, payments, deliveries and accounts are samples.'
    Write-Host ''
    $browserCode = @(
        '$ErrorActionPreference = ''Stop''',
        'for ($attempt = 0; $attempt -lt 120; $attempt++) {',
        '  try {',
        '    $response = Invoke-WebRequest -Uri $env:ECOBIZ_DEMO_URL -UseBasicParsing -TimeoutSec 3',
        '    if ($response.StatusCode -eq 200 -and $response.Content -match ''EcoBiz'') {',
        '      Start-Process $env:ECOBIZ_DEMO_URL',
        '      exit 0',
        '    }',
        '  } catch { }',
        '  Start-Sleep -Seconds 1',
        '}'
    ) -join [Environment]::NewLine
    $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($browserCode))
    $opener = Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-WindowStyle', 'Hidden', '-EncodedCommand', $encoded) -WindowStyle Hidden -PassThru
    Push-Location -LiteralPath $app
    try {
        & (Join-Path $nodeDir 'node.exe') (Join-Path $app 'node_modules\next\dist\bin\next') start --hostname 127.0.0.1 --port $port
        if ($LASTEXITCODE -ne 0) { throw 'EcoBiz stopped unexpectedly. Read the message above, then try again.' }
    } finally {
        Pop-Location
        if (-not $opener.HasExited) { Stop-Process -Id $opener.Id -ErrorAction SilentlyContinue }
    }
} catch {
    Write-Host ''
    Write-Host 'EcoBiz could not start.' -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ''
    exit 1
}
