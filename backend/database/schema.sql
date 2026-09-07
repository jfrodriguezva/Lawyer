-- EC Abogados - esquema de base de datos SQL Server
-- Ejecutar contra una base de datos vacía llamada ECAbogados (o la que se configure
-- en ConnectionStrings:Default de backend/src/ECAbogados.Api/appsettings.json).

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'ECAbogados')
BEGIN
    CREATE DATABASE ECAbogados;
END
GO

USE ECAbogados;
GO

-- =========================================================
-- Tabla: Usuarios
-- =========================================================
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios (
        Id INT IDENTITY PRIMARY KEY,
        Email NVARCHAR(256) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(256) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Rol NVARCHAR(50) NOT NULL
    );
END
GO

-- =========================================================
-- Tabla: Casos
-- =========================================================
IF OBJECT_ID(N'dbo.Casos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Casos (
        Id INT IDENTITY PRIMARY KEY,
        ClienteNombre NVARCHAR(200) NOT NULL,
        Tipo NVARCHAR(100) NOT NULL,
        Estatus NVARCHAR(20) NOT NULL,
        FechaApertura DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Notas NVARCHAR(MAX) NULL
    );

    CREATE INDEX IX_Casos_Estatus ON dbo.Casos(Estatus);
END
GO

-- =========================================================
-- Tabla: Citas
-- =========================================================
IF OBJECT_ID(N'dbo.Citas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Citas (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NULL REFERENCES dbo.Casos(Id),
        NombreCliente NVARCHAR(200) NOT NULL,
        Telefono NVARCHAR(30) NOT NULL,
        FechaHora DATETIME2 NOT NULL,
        Estatus NVARCHAR(20) NOT NULL
    );

    CREATE INDEX IX_Citas_FechaHora ON dbo.Citas(FechaHora);
END
GO

-- =========================================================
-- Tabla: Documentos
-- =========================================================
IF OBJECT_ID(N'dbo.Documentos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Documentos (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NOT NULL REFERENCES dbo.Casos(Id),
        NombreArchivo NVARCHAR(300) NOT NULL,
        TipoContenido NVARCHAR(150) NOT NULL,
        TamanoBytes BIGINT NOT NULL,
        FechaCarga DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        RutaAlmacenamiento NVARCHAR(500) NOT NULL
    );
END
GO

-- =========================================================
-- Tabla: MensajesContacto
-- =========================================================
IF OBJECT_ID(N'dbo.MensajesContacto', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MensajesContacto (
        Id INT IDENTITY PRIMARY KEY,
        Nombre NVARCHAR(200) NOT NULL,
        Telefono NVARCHAR(30) NOT NULL,
        Email NVARCHAR(256) NULL,
        Mensaje NVARCHAR(2000) NOT NULL,
        FechaEnvio DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Atendido BIT NOT NULL DEFAULT 0
    );

    CREATE INDEX IX_MensajesContacto_Atendido ON dbo.MensajesContacto(Atendido);
END
GO

-- =========================================================
-- Seed: Usuario administrador
-- =========================================================
-- NOTE: '<BCRYPT_HASH_PLACEHOLDER>' debe reemplazarse por un hash bcrypt real antes de
-- poder iniciar sesión. El IPasswordHasher de la aplicación (BcryptPasswordHasher, basado
-- en BCrypt.Net-Next) genera hashes 100% compatibles con este campo, así que basta con
-- llamar a ese método una vez (por ejemplo desde un pequeño script o REPL de C#) para
-- obtener el hash de la contraseña elegida. Alternativamente, para desarrollo local puede
-- usarse un generador de bcrypt en línea para obtener el hash de la contraseña "Cambiar123!".
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = 'erika@ecabogados.mx')
BEGIN
    INSERT INTO dbo.Usuarios (Email, PasswordHash, Nombre, Rol)
    VALUES ('erika@ecabogados.mx', '$2a$11$Bl1GymEymBs57HgpqaDZ/eGXwiGDXVPhHzaEYZ162epxfuQOw5Tt.', 'Erika Cruz García', 'Administrador');
END
GO

-- =========================================================
-- Seed: Casos y Citas de ejemplo (para poblar el dashboard)
-- =========================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE ClienteNombre = 'María Fernanda López' AND Tipo = 'Divorcio incausado')
BEGIN
    INSERT INTO dbo.Casos (ClienteNombre, Tipo, Estatus, FechaApertura, Notas)
    VALUES
        ('María Fernanda López', 'Divorcio incausado', 'Activo', DATEADD(DAY, -30, SYSUTCDATETIME()), 'Audiencia preliminar programada.'),
        ('Carlos Alberto Ramírez', 'Custodia y pensión', 'Revision', DATEADD(DAY, -15, SYSUTCDATETIME()), 'Pendiente de documentación adicional del cliente.');
END
GO

DECLARE @CasoDivorcioId INT = (SELECT TOP 1 Id FROM dbo.Casos WHERE Tipo = 'Divorcio incausado' ORDER BY Id);
DECLARE @CasoCustodiaId INT = (SELECT TOP 1 Id FROM dbo.Casos WHERE Tipo = 'Custodia y pensión' ORDER BY Id);

IF NOT EXISTS (SELECT 1 FROM dbo.Citas WHERE NombreCliente = 'María Fernanda López')
BEGIN
    INSERT INTO dbo.Citas (CasoId, NombreCliente, Telefono, FechaHora, Estatus)
    VALUES
        (@CasoDivorcioId, 'María Fernanda López', '5512345678', DATEADD(DAY, 2, SYSUTCDATETIME()), 'Confirmada'),
        (@CasoCustodiaId, 'Carlos Alberto Ramírez', '5598765432', DATEADD(DAY, 4, SYSUTCDATETIME()), 'Pendiente');
END
GO
