-- Borra los datos de ejemplo que insertaba schema.sql hasta que se quitó ese
-- seed: los casos con Notas "[DATOS DE PRUEBA] ..." y todo lo que cuelga de
-- ellos (citas, documentos, pagos, etc.).
--
-- Uso (SSMS o sqlcmd, contra ECAbogados):
--   1. Haz un respaldo antes:
--        BACKUP DATABASE ECAbogados TO DISK = '/var/opt/mssql/data/antes-limpieza.bak';
--   2. Ejecuta el script tal cual: termina en ROLLBACK, así que solo MUESTRA lo
--      que borraría, sin borrar nada.
--   3. Si lo que muestra es correcto, cambia el ROLLBACK del final por COMMIT y
--      vuelve a ejecutarlo.
--
-- Si aparecen documentos con RutaAlmacenamiento, esos archivos siguen en el
-- volumen "documentos" del servidor: bórralos a mano después del COMMIT.

USE ECAbogados;
SET NOCOUNT ON;
SET XACT_ABORT ON;
-- sqlcmd lo trae apagado (SSMS no) y Casos tiene un índice filtrado: sin esto
-- el DELETE de Casos falla.
SET QUOTED_IDENTIFIER ON;

BEGIN TRANSACTION;

-- "[" es comodín en LIKE, por eso se escapa.
DECLARE @Casos TABLE (Id INT PRIMARY KEY);
INSERT INTO @Casos (Id)
SELECT Id FROM dbo.Casos WHERE Notas LIKE N'\[DATOS DE PRUEBA\]%' ESCAPE N'\';

PRINT '--- Casos de prueba que se borrarán:';
SELECT c.Id, c.ClienteNombre, c.Tipo, c.Estatus, c.FolioInterno, c.Notas
FROM dbo.Casos c JOIN @Casos t ON t.Id = c.Id;

PRINT '--- Citas que se borrarán:';
SELECT Id, CasoId, NombreCliente, FechaHora, Estatus
FROM dbo.Citas WHERE CasoId IN (SELECT Id FROM @Casos);

PRINT '--- Documentos que se borrarán (los que tengan RutaAlmacenamiento dejan archivo en disco):';
SELECT Id, CasoId, NombreArchivo, RutaAlmacenamiento
FROM dbo.Documentos WHERE CasoId IN (SELECT Id FROM @Casos);

-- Primero las tablas que dependen de Casos, luego los casos.
DELETE FROM dbo.ActualizacionesCaso WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.TareasCaso          WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.RegistrosTiempo     WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.Documentos          WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.ChecklistItems      WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.Plazos              WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.Pagos               WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.Citas               WHERE CasoId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.Auditoria           WHERE Entidad = N'Caso' AND EntidadId IN (SELECT Id FROM @Casos);
DELETE FROM dbo.Casos               WHERE Id IN (SELECT Id FROM @Casos);

PRINT '--- Totales después de borrar (dentro de la transacción):';
SELECT
    (SELECT COUNT(*) FROM dbo.Casos) AS Casos,
    (SELECT COUNT(*) FROM dbo.Citas) AS Citas,
    (SELECT COUNT(*) FROM dbo.Documentos) AS Documentos;

-- Cambia a COMMIT cuando hayas revisado el resultado.
ROLLBACK TRANSACTION;
