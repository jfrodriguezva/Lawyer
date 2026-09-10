<#
.SYNOPSIS
    Respalda la base de datos ECAbogados y los documentos subidos (App_Data/documentos)
    a la carpeta backend/backups, cada uno con timestamp. Gratis, sin servicios externos:
    pensado para programarse con el Programador de tareas de Windows.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File backend\scripts\backup.ps1
#>

param(
    [string]$SqlServer = "localhost",
    [string]$Database = "ECAbogados",
    [int]$DiasRetencion = 30
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $scriptDir
$backupsDir = Join-Path $backendDir "backups"
$documentosDir = Join-Path $backendDir "src\ECAbogados.Api\App_Data\documentos"

if (-not (Test-Path $backupsDir)) {
    New-Item -ItemType Directory -Path $backupsDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "== Respaldo de base de datos =="
$bakPath = Join-Path $backupsDir "ECAbogados_$timestamp.bak"
# Nota: se pasa la ruta directo en -Q (no con -v var="valor") porque el sqlcmd
# clásico de Windows (Client SDK ODBC) rompe la sustitución de variables cuando
# el valor contiene "unidad:\ruta" (se come la letra de unidad). Ver backup.sql
# para la forma equivalente pensada para ejecución manual con -v.
$query = "BACKUP DATABASE [$Database] TO DISK = N'$bakPath' WITH INIT, CHECKSUM, STATS = 10;"
sqlcmd -S $SqlServer -E -Q $query -f 65001
if ($LASTEXITCODE -ne 0) {
    throw "sqlcmd terminó con código $LASTEXITCODE al respaldar la base de datos."
}
Write-Host "Base de datos respaldada en: $bakPath"

Write-Host "== Respaldo de documentos =="
if (Test-Path $documentosDir) {
    $zipPath = Join-Path $backupsDir "documentos_$timestamp.zip"
    Compress-Archive -Path (Join-Path $documentosDir "*") -DestinationPath $zipPath -Force
    Write-Host "Documentos respaldados en: $zipPath"
} else {
    Write-Host "No existe $documentosDir todavía (sin documentos subidos aún); se omite."
}

Write-Host "== Limpieza de respaldos antiguos (> $DiasRetencion días) =="
$limite = (Get-Date).AddDays(-$DiasRetencion)
Get-ChildItem -Path $backupsDir -File | Where-Object { $_.LastWriteTime -lt $limite } | ForEach-Object {
    Write-Host "Eliminando respaldo antiguo: $($_.Name)"
    Remove-Item $_.FullName -Force
}

Write-Host "== Respaldo completo =="
