# Installiert ausschließlich das lokale Widget; keine Änderung an Kühlungsprofilen.
$ErrorActionPreference = 'Stop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Bitte Windows PowerShell als Administrator öffnen und das Skript erneut starten.'
}
$source = Join-Path $PSScriptRoot 'com.jan.loopflow'
$manifest = Get-Content -LiteralPath (Join-Path $source 'manifest.json') -Raw | ConvertFrom-Json
if ($manifest.id -ne 'com.jan.loopflow') { throw 'Unerwartete Widget-ID.' }
foreach ($name in @('manifest.json','widget.mjs','renderer.mjs','icon.svg')) {
    if (-not (Test-Path -LiteralPath (Join-Path $source $name) -PathType Leaf)) { throw "Datei fehlt: $name" }
}
$root = Join-Path $env:ProgramData 'Nexus'
if (-not (Test-Path -LiteralPath $root -PathType Container)) {
    throw 'Nexus-Datenordner wurde nicht gefunden. Nexus 3 einmal starten und wieder beenden.'
}
$target = Join-Path $root 'apps\com.jan.loopflow'
if (Test-Path -LiteralPath $target) {
    $backup = Join-Path $root ('custom-widget-backups\loopflow-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
    New-Item -ItemType Directory -Path $backup -Force | Out-Null
    Copy-Item -LiteralPath $target -Destination $backup -Recurse
    Write-Host "Bisherige Version gesichert: $backup"
}
New-Item -ItemType Directory -Path $target -Force | Out-Null
foreach ($name in @('manifest.json','widget.mjs','renderer.mjs','icon.svg')) {
    Copy-Item -LiteralPath (Join-Path $source $name) -Destination (Join-Path $target $name) -Force
}
Write-Host 'Loop Flow installiert. Nexus vollstaendig neu starten.'
Write-Host 'Konfiguration am PC: Nexus > Mehr anzeigen > Loop Flow. Aenderungen speichern automatisch.'
