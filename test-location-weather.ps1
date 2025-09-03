<#
PowerShell test for /api/location/weather
Usage:
  .\test-location-weather.ps1                # use default http://localhost:5001
  .\test-location-weather.ps1 -Host 'http://127.0.0.1' -Port 5001

Exit codes:
  0 = pass (response is mock provider and expected fields present)
  1 = network / request error
  2 = assertion failed (response missing expected fields or provider not mock)
#>
param(
$param(
    [string]$ServerHost = 'http://localhost',
    [int]$Port = 5001,
    [int]$TimeoutSec = 30
)

$uri = "{0}:{1}/api/location/weather" -f $ServerHost.TrimEnd('/'), $Port
$body = @{ state = 'Gujarat'; district = 'Baroda' } | ConvertTo-Json

Write-Host "POST $uri`nBody: $body`n"

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType 'application/json' -TimeoutSec $TimeoutSec
} catch {
    Write-Error "Request failed: $($_.Exception.Message)"
    exit 1
}

Write-Host "Response JSON:`n" ($response | ConvertTo-Json -Depth 5)

# Basic assertions
$hasTemp = $null -ne $response.tempC -or $null -ne $response.temp
$hasHumidity = $null -ne $response.humidity
$hasRaw = $null -ne $response.raw
$provider = if ($hasRaw -and $response.raw.provider) { $response.raw.provider } else { $null }

if (-not ($hasTemp -and $hasHumidity -and $hasRaw)) {
    Write-Host "FAIL: Response missing expected fields (temp/humidity/raw)."
    exit 2
}

Write-Host "Detected provider: $provider"

if ($provider -eq 'mock') {
    Write-Host "PASS: Response is mock provider as expected."
    exit 0
} else {
    Write-Host "WARNING: Response provider is not 'mock' (value: $provider). If you expect live API data, ensure WEATHER_API_KEY is configured and server can reach the weather API."
    exit 2
    Write-Host "WARNING: Response provider is not 'mock' (value: $provider). If you expect live API data, ensure WEATHER_API_KEY is configured and server can reach the weather API."
        exit 2
}
