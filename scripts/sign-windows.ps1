#!/usr/bin/env pwsh
# Code-signing wrapper for Tauri builds.
# Reads cert path + password from environment so the secret never
# lives in tauri.conf.json (which goes to git).
#
# Required env vars:
#   CERT_PATH      — absolute path to the .pfx file
#   CERT_PASSWORD  — password for the .pfx (empty string if none)
#
# Optional:
#   SIGNTOOL_PATH  — full path to signtool.exe (autodetected if omitted)
#
# Usage (Tauri invokes this with the file to sign as $args[0]):
#   pwsh -NoProfile -ExecutionPolicy Bypass -File sign-windows.ps1 <file>

param([Parameter(Mandatory = $true)][string]$FilePath)

$ErrorActionPreference = 'Stop'

$certPath = $env:CERT_PATH
$certPassword = $env:CERT_PASSWORD

if ([string]::IsNullOrWhiteSpace($certPath)) {
    Write-Error 'CERT_PATH env var is not set.'
    exit 1
}
if (-not (Test-Path $certPath)) {
    Write-Error "Certificate file not found: $certPath"
    exit 1
}

$signtool = $env:SIGNTOOL_PATH
if ([string]::IsNullOrWhiteSpace($signtool)) {
    # Autodetect newest signtool.exe under Windows Kits/10/bin/.../x64
    $signtool = (Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Filter 'signtool.exe' -Recurse -ErrorAction SilentlyContinue |
        Where-Object FullName -match '\\x64\\' |
        Sort-Object FullName -Descending |
        Select-Object -First 1).FullName
}
if (-not $signtool -or -not (Test-Path $signtool)) {
    Write-Error 'signtool.exe not found. Install Windows 10/11 SDK or set SIGNTOOL_PATH.'
    exit 1
}

Write-Host "Signing $FilePath with $certPath..."

& $signtool sign `
    /fd sha256 `
    /tr 'http://timestamp.digicert.com' `
    /td sha256 `
    /f $certPath `
    /p $certPassword `
    $FilePath

exit $LASTEXITCODE
