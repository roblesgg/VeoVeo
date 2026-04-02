$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Configurando adb reverse para Metro por USB..."
adb reverse tcp:8081 tcp:8081

Write-Host "Lanzando app test en Android..."
cmd /c "cd /d $repoRoot && set APP_ENV=test&& npx expo run:android"
