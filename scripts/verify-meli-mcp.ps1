Write-Host "Verifying Meli MCP Proxy..."

$baseUrl = "https://mismartdash.vercel.app/api/mcp/mercadolibre"

# 1. Healthcheck
try {
    Write-Host "CHECK 1: Healthcheck"
    $healthRes = Invoke-WebRequest -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
    Write-Host "Status: $($healthRes.StatusCode)"
    Write-Host "Body: $($healthRes.Content)"
} catch {
    Write-Host "Healthcheck failed: $_"
    exit 1
}

# 2. SSE Support
try {
    Write-Host "CHECK 2: SSE Support"
    $sseRes = Invoke-WebRequest -Uri "$baseUrl" -Method Get -Headers @{ "Accept" = "text/event-stream" } -ErrorAction Stop
    Write-Host "Status: $($sseRes.StatusCode)"
    # Don't print body as it might be streaming or huge
} catch {
    Write-Host "SSE failed: $_"
    # Don't exit here, might be 400 or other valid ML response
}

# 3. Basic Request (should fail if no params, but check auth injection)
try {
    Write-Host "CHECK 3: Basic Request"
    # This will likely 404 or 400 from ML because no path/resource specified, but we check if we get past our proxy auth
    $basicRes = Invoke-WebRequest -Uri "$baseUrl" -Method Get -ErrorAction SilentlyContinue
    
    if ($basicRes.StatusCode -eq 401) {
        Write-Host "FAIL: Received 401 from Proxy (or upstream without token refresh)"
        exit 1
    } elseif ($basicRes.StatusCode -eq 502) {
        Write-Host "FAIL: Received 502 (Bad Gateway / Refresh Failed)"
        exit 1
    } else {
        Write-Host "SUCCESS: Received $($basicRes.StatusCode) (Expected from ML API when called without resource)"
    }

} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "FAIL: Received 401"
        exit 1
    }
    Write-Host "Received expected error code from ML: $code"
}

Write-Host "Verification Complete"
