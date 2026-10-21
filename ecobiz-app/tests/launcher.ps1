$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$launcher = Join-Path $repo 'START_ECOBIZ.bat'
if (-not (Test-Path -LiteralPath $launcher)) { throw 'Expected a root START_ECOBIZ.bat that handles setup without manual commands.' }
$source = [IO.File]::ReadAllText($launcher)
$marker = '# ECOBIZ POWERSHELL'
$code = $source.Substring($source.LastIndexOf($marker) + $marker.Length)
$tokens = $null; $parseErrors = $null
$ast = [Management.Automation.Language.Parser]::ParseInput($code, [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count) { throw ($parseErrors | Out-String) }
$ast.FindAll({ param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] }, $false) | ForEach-Object { . ([scriptblock]::Create($_.Extent.Text)) }
function Assert-EcoTest($condition, $message) { if (-not $condition) { throw $message } }
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = [IO.Path]::GetFullPath((Join-Path $tempBase ('EcoBiz launcher tests ' + [guid]::NewGuid())))
if (-not $testRoot.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe test directory.' }
New-Item -ItemType Directory -Path $testRoot | Out-Null
$occupied = $null
try {
    $occupied = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 3001)
    try { $occupied.Start() } catch { $occupied = $null }
    $port = Find-EcoPort
    Assert-EcoTest ($port -gt 3001 -and $port -le 3010) 'An occupied default port must select another local port.'
    if ($occupied) { $occupied.Stop(); $occupied = $null }

    $payload = Join-Path $testRoot 'zip payload'
    New-Item -ItemType Directory -Path $payload | Out-Null
    [IO.File]::WriteAllText((Join-Path $payload 'node.txt'), 'test archive')
    $zip = Join-Path $testRoot 'runtime.zip'
    Compress-Archive -Path (Join-Path $payload '*') -DestinationPath $zip
    $expectedHash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash
    function Get-FileHash { throw 'Get-FileHash unavailable on this clean Windows environment.' }
    $runtime = Join-Path $testRoot 'private runtime'
    $rejected = $false
    try { Expand-EcoRuntime $zip ('0' * 64) $runtime } catch { $rejected = $_.Exception.Message -match 'checksum' }
    Assert-EcoTest $rejected 'A mismatched download must be rejected before extraction.'
    Assert-EcoTest (-not (Test-Path -LiteralPath $runtime)) 'An unverified download must not be extracted.'
    Expand-EcoRuntime $zip $expectedHash $runtime
    Assert-EcoTest (Test-Path -LiteralPath (Join-Path $runtime 'node.txt')) 'A verified runtime archive should extract successfully.'

    $app = Join-Path $testRoot 'app with spaces'
    $nodeDir = Join-Path $testRoot 'node with spaces'
    $cache = Join-Path $testRoot 'setup state'
    New-Item -ItemType Directory -Path $app, $nodeDir, $cache | Out-Null
    $env:ECOBIZ_TEST_APP = $app
    $env:ECOBIZ_TEST_LOG = Join-Path $testRoot 'npm calls.txt'
    $env:ECOBIZ_TEST_NPM_EXIT = '0'
    $npmFixture = @(
        '@echo off',
        'if "%1"=="run" goto build',
        'echo install>>"%ECOBIZ_TEST_LOG%"',
        'if not "%ECOBIZ_TEST_NPM_EXIT%"=="0" exit /b %ECOBIZ_TEST_NPM_EXIT%',
        'if not exist "%ECOBIZ_TEST_APP%\node_modules\next\dist\bin" mkdir "%ECOBIZ_TEST_APP%\node_modules\next\dist\bin"',
        'echo next>"%ECOBIZ_TEST_APP%\node_modules\next\dist\bin\next"',
        'exit /b 0',
        ':build',
        'echo build>>"%ECOBIZ_TEST_LOG%"',
        'if not "%ECOBIZ_TEST_BUILD_EXIT%"=="0" exit /b %ECOBIZ_TEST_BUILD_EXIT%',
        'if not exist "%ECOBIZ_TEST_APP%\.next" mkdir "%ECOBIZ_TEST_APP%\.next"',
        'echo built>"%ECOBIZ_TEST_APP%\.next\BUILD_ID"',
        'exit /b 0'
    ) -join [Environment]::NewLine
    [IO.File]::WriteAllText((Join-Path $nodeDir 'npm.cmd'), $npmFixture)
    $lock = Join-Path $app 'package-lock.json'
    [IO.File]::WriteAllText($lock, 'first dependency version')
    Install-EcoDependencies $app $nodeDir $cache
    Install-EcoDependencies $app $nodeDir $cache
    Assert-EcoTest (@(Get-Content -LiteralPath $env:ECOBIZ_TEST_LOG).Count -eq 1) 'Unchanged dependencies should install only once.'
    [IO.File]::WriteAllText($lock, 'second dependency version')
    Install-EcoDependencies $app $nodeDir $cache
    Assert-EcoTest (@(Get-Content -LiteralPath $env:ECOBIZ_TEST_LOG).Count -eq 2) 'A changed lockfile must refresh dependencies.'
    $stamp = Join-Path $cache 'dependencies.sha256'
    $previous = [IO.File]::ReadAllText($stamp)
    [IO.File]::WriteAllText($lock, 'third dependency version')
    $env:ECOBIZ_TEST_NPM_EXIT = '7'
    $failed = $false
    try { Install-EcoDependencies $app $nodeDir $cache } catch { $failed = $_.Exception.Message -match 'dependencies' }
    Assert-EcoTest $failed 'A failed npm install must stop setup with a readable error.'
    Assert-EcoTest ([IO.File]::ReadAllText($stamp) -eq $previous) 'A failed install must not mark dependencies as ready.'
    $env:ECOBIZ_TEST_NPM_EXIT = '0'
    Install-EcoDependencies $app $nodeDir $cache
    Remove-Item -LiteralPath (Join-Path $app 'node_modules\next\dist\bin\next')
    Install-EcoDependencies $app $nodeDir $cache
    Assert-EcoTest (@(Get-Content -LiteralPath $env:ECOBIZ_TEST_LOG).Count -eq 5) 'Missing installed files must trigger repair even with a matching lockfile.'
    New-Item -ItemType Directory -Path (Join-Path $app 'src'), (Join-Path $app 'public') | Out-Null
    [IO.File]::WriteAllText((Join-Path $app 'package.json'), '{}')
    $sourceFile = Join-Path $app 'src/page.tsx'
    $assetFile = Join-Path $app 'public/photo.txt'
    [IO.File]::WriteAllText($sourceFile, 'first page')
    [IO.File]::WriteAllText($assetFile, 'first image')
    $env:ECOBIZ_TEST_BUILD_EXIT = '0'
    Build-EcoApp $app $nodeDir $cache
    Build-EcoApp $app $nodeDir $cache
    Assert-EcoTest (@(Get-Content -LiteralPath $env:ECOBIZ_TEST_LOG | Where-Object { $_ -eq 'build' }).Count -eq 1) 'An unchanged app should reuse its production build.'
    [IO.File]::WriteAllText($sourceFile, 'updated page')
    Build-EcoApp $app $nodeDir $cache
    [IO.File]::WriteAllText($assetFile, 'updated image')
    Build-EcoApp $app $nodeDir $cache
    Assert-EcoTest (@(Get-Content -LiteralPath $env:ECOBIZ_TEST_LOG | Where-Object { $_ -eq 'build' }).Count -eq 3) 'Source and public-asset changes must rebuild automatically.'
    $buildStamp = Join-Path $cache 'build.sha256'
    $previousBuild = [IO.File]::ReadAllText($buildStamp)
    [IO.File]::WriteAllText($sourceFile, 'changed page before failed build')
    $env:ECOBIZ_TEST_BUILD_EXIT = '8'
    $buildFailed = $false
    try { Build-EcoApp $app $nodeDir $cache } catch { $buildFailed = $_.Exception.Message -match 'build' }
    Assert-EcoTest $buildFailed 'A failed production build must stop startup.'
    Assert-EcoTest ([IO.File]::ReadAllText($buildStamp) -eq $previousBuild) 'A failed build must not mark changed source as ready.'
    $env:ECOBIZ_TEST_BUILD_EXIT = '0'
    Build-EcoApp $app $nodeDir $cache
    Write-Host 'PASS: launcher parsing, busy-port fallback, verified downloads, spaces in paths, dependency caching, updates and failed-install recovery, automatic production builds and stale-build prevention'
} finally {
    if ($occupied) { $occupied.Stop() }
    foreach ($name in @('ECOBIZ_TEST_APP','ECOBIZ_TEST_LOG','ECOBIZ_TEST_NPM_EXIT','ECOBIZ_TEST_BUILD_EXIT')) { Remove-Item -LiteralPath ('Env:' + $name) -ErrorAction SilentlyContinue }
    if ($testRoot.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase) -and (Split-Path -Leaf $testRoot) -like 'EcoBiz launcher tests *') {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
