# Script de utilidad para diagnosticar problemas de Google Auth

Write-Host "🔍 Iniciando diagnóstico de Google Sign-In..." -ForegroundColor Cyan

$repoRoot = $PSScriptRoot
if ($repoRoot.EndsWith("\scripts")) { $repoRoot = Split-Path -Parent $repoRoot }

$googleServicesPath = Join-Path $repoRoot "google-services.json"

if (Test-Path $googleServicesPath) {
    Write-Host "✅ Se encontró google-services.json" -ForegroundColor Green
    $json = Get-Content $googleServicesPath | ConvertFrom-Json
    
    Write-Host "📦 Paquetes registrados en Firebase:"
    foreach ($client in $json.client) {
        Write-Host "   - $($client.client_info.android_client_info.package_name)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No se encontró google-services.json en la raíz." -ForegroundColor Red
}

Write-Host "`n🚀 Para solucionar el DEVELOPER_ERROR, ejecuta el siguiente comando:" -ForegroundColor Cyan
Write-Host "cd android; ./gradlew signingReport" -ForegroundColor White
Write-Host "`nLuego, copia la SHA-1 de la variante 'debug' y verifícala en la consola de Firebase." -ForegroundColor Gray
