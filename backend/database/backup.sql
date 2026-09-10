-- Respaldo completo de la base de datos ECAbogados.
-- Pensado para ejecutarse vía sqlcmd con la variable $(BackupPath) ya resuelta
-- por backend/scripts/backup.ps1 (nombre de archivo con timestamp).
-- Uso manual:
--   sqlcmd -S localhost -E -v BackupPath="C:\ruta\ECAbogados_20260101_120000.bak" -i backup.sql -f 65001

-- Nota: sin COMPRESSION porque SQL Server Express (edición gratuita) no la soporta.
BACKUP DATABASE ECAbogados
TO DISK = N'$(BackupPath)'
WITH INIT, CHECKSUM, STATS = 10;
