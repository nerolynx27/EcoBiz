$ErrorActionPreference = 'Stop'
$ecobizRuleName = 'EcoBiz-LAN-3001'
if (-not (Get-NetFirewallRule -Name $ecobizRuleName -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name $ecobizRuleName -DisplayName 'EcoBiz LAN (TCP 3001)' `
        -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001 `
        -RemoteAddress LocalSubnet -InterfaceAlias 'Wi-Fi' `
        -Program 'C:\Program Files\nodejs\node.exe' -Profile Any | Out-Null
}
Write-Host 'EcoBiz LAN firewall rule is ready.'
