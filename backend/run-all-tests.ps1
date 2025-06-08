#!/usr/bin/env pwsh

Write-Host "🚀 SUITE DE TESTS - NEIGHBORHOOD SHOPS BACKEND" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📅 Fecha: $(Get-Date)" -ForegroundColor Yellow
Write-Host "📂 Directorio: $PWD" -ForegroundColor Yellow
Write-Host ""

$tests = @(
    "get-token.js",
    "test-user-setup.js", 
    "test-order.js",
    "test-websocket.js",
    "test-status-update.js",
    "test-websocket-complete.js"
)

$results = @()

foreach ($test in $tests) {
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host "🧪 EJECUTANDO: $test" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Green
    
    try {
        $process = Start-Process -FilePath "node" -ArgumentList $test -Wait -PassThru -NoNewWindow
        $exitCode = $process.ExitCode
        
        $results += @{
            Test = $test
            ExitCode = $exitCode
            Status = if ($exitCode -eq 0) { "ÉXITO" } else { "FALLO" }
        }
        
        Write-Host ""
        if ($exitCode -eq 0) {
            Write-Host "✅ $test terminó exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ $test falló con código: $exitCode" -ForegroundColor Red
        }
        
        # Pausa breve entre tests
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "❌ Error ejecutando $test : $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Test = $test
            ExitCode = 1
            Status = "ERROR"
        }
    }
}

# Resumen final
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE RESULTADOS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

foreach ($result in $results) {
    $color = if ($result.ExitCode -eq 0) { "Green" } else { "Red" }
    $icon = if ($result.ExitCode -eq 0) { "✅" } else { "❌" }
    Write-Host "$icon $($result.Status) - $($result.Test)" -ForegroundColor $color
}

$successes = ($results | Where-Object { $_.ExitCode -eq 0 }).Count
$failures = ($results | Where-Object { $_.ExitCode -ne 0 }).Count
$total = $results.Count

Write-Host ""
Write-Host "📈 ESTADÍSTICAS:" -ForegroundColor Yellow
Write-Host "   ✅ Tests exitosos: $successes/$total" -ForegroundColor Green
Write-Host "   ❌ Tests fallidos: $failures/$total" -ForegroundColor Red
Write-Host "   📊 Tasa de éxito: $([Math]::Round(($successes / $total) * 100))%" -ForegroundColor Yellow

if ($failures -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  $failures test(s) presentaron problemas." -ForegroundColor Yellow
}
