-- ECGAbogados - esquema de base de datos SQL Server
-- Ejecutar contra una base de datos vacía llamada ECAbogados (o la que se configure
-- en ConnectionStrings:Default de backend/src/ECAbogados.Api/appsettings.json).
--
-- NOTA: este script se reconstruyó completo (no incremental) como parte del
-- rediseño a un modelo de citas/prospectos/casos con negociación y roles
-- ampliados. No está pensado para aplicarse sobre una base de datos con el
-- esquema anterior: se ejecuta contra una base de datos nueva.

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'ECAbogados')
BEGIN
    CREATE DATABASE ECAbogados;
END
GO

USE ECAbogados;
GO

-- =========================================================
-- Usuarios (staff): Abogado, Consultor, Agente, Administrador.
-- =========================================================
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios (
        Id INT IDENTITY PRIMARY KEY,
        Email NVARCHAR(256) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(256) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Rol NVARCHAR(50) NOT NULL,
        Activo BIT NOT NULL DEFAULT 1,
        IntentosFallidos INT NOT NULL DEFAULT 0,
        BloqueadoHasta DATETIME2 NULL,
        ResetToken NVARCHAR(64) NULL,
        ResetTokenExpira DATETIME2 NULL,
        CONSTRAINT CK_Usuarios_Rol CHECK (Rol IN ('Abogado', 'Consultor', 'Agente', 'Administrador'))
    );
END
GO

-- =========================================================
-- Clientes (portal autenticado): persona física o moral.
-- =========================================================
IF OBJECT_ID(N'dbo.Clientes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Clientes (
        Id INT IDENTITY PRIMARY KEY,
        Email NVARCHAR(256) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(256) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Activo BIT NOT NULL DEFAULT 1,
        IntentosFallidos INT NOT NULL DEFAULT 0,
        BloqueadoHasta DATETIME2 NULL,
        ResetToken NVARCHAR(64) NULL,
        ResetTokenExpira DATETIME2 NULL,
        TipoPersona NVARCHAR(20) NOT NULL DEFAULT 'Fisica',
        Rfc NVARCHAR(20) NULL,
        -- Datos fiscales adicionales: pendiente de que el despacho defina qué
        -- captura además del RFC. Campo libre para no inventar una estructura.
        DatosFiscalesPendientes NVARCHAR(1000) NULL,
        Telefono NVARCHAR(30) NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        InvitacionPendiente BIT NOT NULL DEFAULT 0,
        CONSTRAINT CK_Clientes_TipoPersona CHECK (TipoPersona IN ('Fisica', 'Moral'))
    );
END
GO

-- =========================================================
-- Prospectos: interesados que aún no son Cliente.
-- =========================================================
IF OBJECT_ID(N'dbo.Prospectos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Prospectos (
        Id INT IDENTITY PRIMARY KEY,
        Nombre NVARCHAR(200) NOT NULL,
        Email NVARCHAR(256) NOT NULL,
        Telefono NVARCHAR(30) NOT NULL,
        MedioContactoPreferido NVARCHAR(50) NULL,
        Origen NVARCHAR(100) NULL,
        ServicioInteres NVARCHAR(150) NULL,
        ConflictoInteres NVARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        ResponsableUsuarioId INT NULL REFERENCES dbo.Usuarios(Id),
        ResultadoEntrevista NVARCHAR(2000) NULL,
        Etapa NVARCHAR(30) NOT NULL DEFAULT 'Nuevo',
        MotivoNoContratacion NVARCHAR(500) NULL,
        ClienteId INT NULL REFERENCES dbo.Clientes(Id),
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Prospectos_ConflictoInteres CHECK (ConflictoInteres IN ('Pendiente', 'Revisado', 'Autorizado', 'Rechazado')),
        CONSTRAINT CK_Prospectos_Etapa CHECK (Etapa IN ('Nuevo', 'EnRevision', 'EntrevistaRealizada', 'Contratado', 'NoContratado'))
    );

    CREATE INDEX IX_Prospectos_Email ON dbo.Prospectos(Email);
    CREATE INDEX IX_Prospectos_Etapa ON dbo.Prospectos(Etapa);
END
GO

-- =========================================================
-- Casos (expedientes jurídicos).
-- =========================================================
IF OBJECT_ID(N'dbo.Casos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Casos (
        Id INT IDENTITY PRIMARY KEY,
        ClienteNombre NVARCHAR(200) NOT NULL,
        Tipo NVARCHAR(100) NOT NULL,
        Estatus NVARCHAR(20) NOT NULL,
        FechaApertura DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Notas NVARCHAR(MAX) NULL,
        TokenAcceso NVARCHAR(64) NULL,
        TokenGeneradoEn DATETIME2 NULL,
        ClienteId INT NULL REFERENCES dbo.Clientes(Id),
        AbogadoResponsableId INT NULL REFERENCES dbo.Usuarios(Id),
        Prioridad NVARCHAR(20) NULL,
        FolioInterno NVARCHAR(50) NULL,
        ContraparteNombre NVARCHAR(200) NULL,
        AutoridadOrganismo NVARCHAR(200) NULL,
        NumeroExpedienteExterno NVARCHAR(100) NULL,
        FechaCierre DATETIME2 NULL,
        MotivoCierre NVARCHAR(500) NULL,
        Archivado BIT NOT NULL DEFAULT 0,
        -- Honorarios: monto total acordado (opcional) para calcular saldo contra Pagos.
        MontoAcordado DECIMAL(12,2) NULL,
        CONSTRAINT CK_Casos_Estatus CHECK (Estatus IN ('Activo', 'Revision', 'Cerrado'))
    );

    CREATE INDEX IX_Casos_Estatus ON dbo.Casos(Estatus);
    CREATE UNIQUE INDEX UX_Casos_TokenAcceso ON dbo.Casos(TokenAcceso) WHERE TokenAcceso IS NOT NULL;
    CREATE INDEX IX_Casos_ClienteId ON dbo.Casos(ClienteId);
    CREATE INDEX IX_Casos_AbogadoResponsableId ON dbo.Casos(AbogadoResponsableId);
END
GO

-- =========================================================
-- Actualizaciones de caso: separación estricta interno/compartido.
-- =========================================================
IF OBJECT_ID(N'dbo.ActualizacionesCaso', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ActualizacionesCaso (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NOT NULL REFERENCES dbo.Casos(Id),
        Texto NVARCHAR(2000) NOT NULL,
        Visibilidad NVARCHAR(20) NOT NULL,
        UsuarioId INT NOT NULL,
        UsuarioNombre NVARCHAR(200) NULL,
        Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_ActualizacionesCaso_Visibilidad CHECK (Visibilidad IN ('Interna', 'Compartida'))
    );

    CREATE INDEX IX_ActualizacionesCaso_CasoId ON dbo.ActualizacionesCaso(CasoId);
END
GO

-- =========================================================
-- TareasCaso: pendientes de trabajo interno (distinto de Plazo, que es una
-- fecha límite procesal/de audiencia).
-- =========================================================
IF OBJECT_ID(N'dbo.TareasCaso', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TareasCaso (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NOT NULL REFERENCES dbo.Casos(Id),
        Descripcion NVARCHAR(300) NOT NULL,
        ResponsableUsuarioId INT NULL REFERENCES dbo.Usuarios(Id),
        FechaVencimiento DATETIME2 NULL,
        Completada BIT NOT NULL DEFAULT 0,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_TareasCaso_CasoId ON dbo.TareasCaso(CasoId);
    CREATE INDEX IX_TareasCaso_Completada ON dbo.TareasCaso(Completada);
END
GO

-- =========================================================
-- Notificaciones: centro de notificaciones interno del staff.
-- =========================================================
IF OBJECT_ID(N'dbo.Notificaciones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notificaciones (
        Id INT IDENTITY PRIMARY KEY,
        DestinatarioTipo NVARCHAR(20) NOT NULL,
        DestinatarioId INT NOT NULL,
        Titulo NVARCHAR(200) NOT NULL,
        Mensaje NVARCHAR(1000) NOT NULL,
        Leida BIT NOT NULL DEFAULT 0,
        Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Enlace NVARCHAR(300) NULL,
        CONSTRAINT CK_Notificaciones_DestinatarioTipo CHECK (DestinatarioTipo IN ('Usuario', 'Cliente'))
    );

    CREATE INDEX IX_Notificaciones_Destinatario ON dbo.Notificaciones(DestinatarioTipo, DestinatarioId, Leida);
END
GO

-- =========================================================
-- Plantillas de mensaje reutilizables (WhatsApp/correo).
-- =========================================================
IF OBJECT_ID(N'dbo.PlantillasMensaje', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PlantillasMensaje (
        Id INT IDENTITY PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL,
        Contenido NVARCHAR(2000) NOT NULL
    );
END
GO

-- =========================================================
-- Registro de tiempo dedicado por Usuario a un Caso (control de carga de trabajo).
-- =========================================================
IF OBJECT_ID(N'dbo.RegistrosTiempo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RegistrosTiempo (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NOT NULL REFERENCES dbo.Casos(Id),
        UsuarioId INT NOT NULL REFERENCES dbo.Usuarios(Id),
        UsuarioNombre NVARCHAR(200) NULL,
        Minutos INT NOT NULL,
        Descripcion NVARCHAR(300) NULL,
        Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_RegistrosTiempo_CasoId ON dbo.RegistrosTiempo(CasoId);
    CREATE INDEX IX_RegistrosTiempo_Fecha ON dbo.RegistrosTiempo(Fecha);
END
GO

-- =========================================================
-- SolicitudesCita: negociación de fecha/hora antes de confirmarse.
-- =========================================================
IF OBJECT_ID(N'dbo.SolicitudesCita', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SolicitudesCita (
        Id INT IDENTITY PRIMARY KEY,
        ProspectoId INT NULL REFERENCES dbo.Prospectos(Id),
        ClienteId INT NULL REFERENCES dbo.Clientes(Id),
        NombreSolicitante NVARCHAR(200) NOT NULL,
        EmailSolicitante NVARCHAR(256) NOT NULL,
        TelefonoSolicitante NVARCHAR(30) NOT NULL,
        MedioContactoPreferido NVARCHAR(50) NULL,
        Modulo NVARCHAR(20) NOT NULL,
        ServicioInteres NVARCHAR(150) NULL,
        Descripcion NVARCHAR(2000) NULL,
        FechaHoraPropuesta DATETIME2 NOT NULL,
        Modalidad NVARCHAR(20) NOT NULL,
        Estatus NVARCHAR(40) NOT NULL DEFAULT 'SolicitudRecibida',
        ResponsableUsuarioId INT NULL REFERENCES dbo.Usuarios(Id),
        Motivo NVARCHAR(1000) NULL,
        CitaId INT NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        TokenPublico NVARCHAR(64) NOT NULL,
        -- Consentimiento del aviso de privacidad, capturado en el mismo momento
        -- del envío (paso final del formulario público).
        AceptoAvisoPrivacidad BIT NOT NULL DEFAULT 0,
        FechaConsentimiento DATETIME2 NULL,
        CONSTRAINT CK_SolicitudesCita_Modulo CHECK (Modulo IN ('Abogado', 'SAT')),
        CONSTRAINT CK_SolicitudesCita_Modalidad CHECK (Modalidad IN ('Presencial', 'Videollamada', 'Llamada')),
        CONSTRAINT CK_SolicitudesCita_Estatus CHECK (Estatus IN (
            'SolicitudRecibida', 'EnRevision', 'InformacionRequerida', 'HorarioAlternativoPropuesto',
            'PendienteConfirmacionSolicitante', 'Confirmada', 'Realizada', 'Cancelada', 'NoAsistio',
            'Rechazada', 'ConvertidaEnContratacion'))
    );

    CREATE UNIQUE INDEX UX_SolicitudesCita_TokenPublico ON dbo.SolicitudesCita(TokenPublico);
    CREATE INDEX IX_SolicitudesCita_Estatus ON dbo.SolicitudesCita(Estatus);
    CREATE INDEX IX_SolicitudesCita_ProspectoId ON dbo.SolicitudesCita(ProspectoId);
    CREATE INDEX IX_SolicitudesCita_FechaHoraPropuesta ON dbo.SolicitudesCita(FechaHoraPropuesta);
END
GO

IF OBJECT_ID(N'dbo.HistorialCitaCambios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.HistorialCitaCambios (
        Id INT IDENTITY PRIMARY KEY,
        SolicitudCitaId INT NOT NULL REFERENCES dbo.SolicitudesCita(Id),
        FechaHoraPropuesta DATETIME2 NOT NULL,
        PropuestoPor NVARCHAR(20) NOT NULL,
        Motivo NVARCHAR(1000) NULL,
        Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_HistorialCitaCambios_PropuestoPor CHECK (PropuestoPor IN ('Staff', 'Solicitante'))
    );

    CREATE INDEX IX_HistorialCitaCambios_SolicitudCitaId ON dbo.HistorialCitaCambios(SolicitudCitaId);
END
GO

-- =========================================================
-- Citas confirmadas (calendario). Además de las nacidas de una
-- SolicitudCita aceptada, el staff puede crear citas directas (walk-ins).
-- =========================================================
IF OBJECT_ID(N'dbo.Citas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Citas (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NULL REFERENCES dbo.Casos(Id),
        NombreCliente NVARCHAR(200) NOT NULL,
        Telefono NVARCHAR(30) NOT NULL,
        FechaHora DATETIME2 NOT NULL,
        Estatus NVARCHAR(20) NOT NULL,
        RecordatorioEnviado BIT NOT NULL DEFAULT 0,
        ServicioInteres NVARCHAR(100) NULL,
        CONSTRAINT CK_Citas_Estatus CHECK (Estatus IN ('Pendiente', 'Confirmada', 'Realizada', 'Cancelada', 'NoAsistio'))
    );

    CREATE INDEX IX_Citas_FechaHora ON dbo.Citas(FechaHora);
END
GO

-- =========================================================
-- Documentos: jerarquía Cliente -> Caso -> Documento, con visibilidad y
-- estatus de revisión. RutaAlmacenamiento es NULL cuando SoloRegistro = 1
-- (el documento se entregó por otro medio y solo se deja constancia).
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
        RutaAlmacenamiento NVARCHAR(500) NULL,
        Descripcion NVARCHAR(500) NULL,
        Categoria NVARCHAR(100) NULL,
        Visibilidad NVARCHAR(20) NOT NULL DEFAULT 'Interno',
        Estatus NVARCHAR(20) NOT NULL DEFAULT 'Recibido',
        ComentarioRevision NVARCHAR(1000) NULL,
        Version INT NOT NULL DEFAULT 1,
        SubidoPorTipo NVARCHAR(20) NOT NULL DEFAULT 'Staff',
        SubidoPorId INT NULL,
        SubidoPorNombre NVARCHAR(200) NULL,
        SoloRegistro BIT NOT NULL DEFAULT 0,
        CONSTRAINT CK_Documentos_Visibilidad CHECK (Visibilidad IN ('Interno', 'Compartido', 'SubidoPorCliente')),
        CONSTRAINT CK_Documentos_Estatus CHECK (Estatus IN ('Pendiente', 'Recibido', 'EnRevision', 'Aceptado', 'Rechazado', 'RequiereCorreccion')),
        CONSTRAINT CK_Documentos_SubidoPorTipo CHECK (SubidoPorTipo IN ('Staff', 'Cliente'))
    );

    CREATE INDEX IX_Documentos_CasoId ON dbo.Documentos(CasoId);
END
GO

-- =========================================================
-- Checklist de requisitos por caso.
-- =========================================================
IF OBJECT_ID(N'dbo.ChecklistItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ChecklistItems (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NOT NULL REFERENCES dbo.Casos(Id),
        Descripcion NVARCHAR(300) NOT NULL,
        Completado BIT NOT NULL DEFAULT 0
    );

    CREATE INDEX IX_ChecklistItems_CasoId ON dbo.ChecklistItems(CasoId);
END
GO

-- =========================================================
-- Plazos y audiencias (calendario procesal).
-- =========================================================
IF OBJECT_ID(N'dbo.Plazos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Plazos (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NOT NULL REFERENCES dbo.Casos(Id),
        Descripcion NVARCHAR(300) NOT NULL,
        FechaLimite DATETIME2 NOT NULL,
        Cumplido BIT NOT NULL DEFAULT 0,
        AlertaEnviada BIT NOT NULL DEFAULT 0
    );

    CREATE INDEX IX_Plazos_FechaLimite ON dbo.Plazos(FechaLimite);
END
GO

-- =========================================================
-- Honorarios y pagos por caso (desacoplado del expediente).
-- =========================================================
IF OBJECT_ID(N'dbo.Pagos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Pagos (
        Id INT IDENTITY PRIMARY KEY,
        CasoId INT NOT NULL REFERENCES dbo.Casos(Id),
        Concepto NVARCHAR(200) NOT NULL,
        Monto DECIMAL(10,2) NOT NULL,
        Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Tipo NVARCHAR(20) NOT NULL DEFAULT 'Pago',
        CONSTRAINT CK_Pagos_Tipo CHECK (Tipo IN ('Anticipo', 'Pago', 'Ajuste'))
    );

    CREATE INDEX IX_Pagos_CasoId ON dbo.Pagos(CasoId);
END
GO

-- =========================================================
-- Mensajes de contacto (formulario público, distinto de SolicitudCita).
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
        Atendido BIT NOT NULL DEFAULT 0,
        ServicioInteres NVARCHAR(100) NULL
    );

    CREATE INDEX IX_MensajesContacto_Atendido ON dbo.MensajesContacto(Atendido);
END
GO

-- =========================================================
-- Auditoría de acciones sensibles.
-- =========================================================
IF OBJECT_ID(N'dbo.Auditoria', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auditoria (
        Id INT IDENTITY PRIMARY KEY,
        Entidad NVARCHAR(50) NOT NULL,
        EntidadId INT NOT NULL,
        Accion NVARCHAR(200) NOT NULL,
        Detalle NVARCHAR(1000) NULL,
        UsuarioId INT NULL,
        UsuarioNombre NVARCHAR(200) NULL,
        Fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Ip NVARCHAR(45) NULL,
        UserAgent NVARCHAR(500) NULL
    );

    CREATE INDEX IX_Auditoria_Entidad_EntidadId ON dbo.Auditoria(Entidad, EntidadId);
    CREATE INDEX IX_Auditoria_Fecha ON dbo.Auditoria(Fecha);
END
GO

-- =========================================================
-- Configuración editable: catálogos y feature flags (SAT, Comercializadora).
-- Clave/valor simple a propósito -- evita tablas nuevas por cada opción.
-- =========================================================
IF OBJECT_ID(N'dbo.Configuracion', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Configuracion (
        Clave NVARCHAR(100) NOT NULL PRIMARY KEY,
        Valor NVARCHAR(1000) NOT NULL,
        Descripcion NVARCHAR(500) NULL
    );

    INSERT INTO dbo.Configuracion (Clave, Valor, Descripcion) VALUES
        ('sat_habilitado', 'false', 'Activa el módulo informativo de trámites SAT (rol Consultor).'),
        ('comercializadora_habilitada', 'false', 'Activa el módulo de Comercializadora (rol Agente). Pendiente de definición de negocio.'),
        ('documentos_cuota_total_mb', '2048', 'Cuota total aproximada de almacenamiento local de documentos.');
END
GO

-- =========================================================
-- Catálogo de trámites SAT: solo estructura, sin datos reales todavía.
-- Módulo desacoplado del núcleo jurídico -- activarlo no debe requerir
-- tocar tablas de Casos/Clientes/Documentos.
-- =========================================================
IF OBJECT_ID(N'dbo.CatalogoTramitesSAT', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CatalogoTramitesSAT (
        Id INT IDENTITY PRIMARY KEY,
        Nombre NVARCHAR(200) NOT NULL,
        Requisitos NVARCHAR(MAX) NULL,
        Etapas NVARCHAR(MAX) NULL,
        Observaciones NVARCHAR(1000) NULL,
        Activo BIT NOT NULL DEFAULT 1
    );
END
GO

-- =========================================================
-- Seguimiento de trámites SAT por Cliente (instancia de una entrada del
-- catálogo). Exclusivamente informativo: nunca guarda contraseñas ni e.firma.
-- =========================================================
IF OBJECT_ID(N'dbo.TramitesSAT', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TramitesSAT (
        Id INT IDENTITY PRIMARY KEY,
        ClienteId INT NOT NULL REFERENCES dbo.Clientes(Id),
        CatalogoTramiteId INT NOT NULL REFERENCES dbo.CatalogoTramitesSAT(Id),
        Estatus NVARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        ResponsableUsuarioId INT NULL REFERENCES dbo.Usuarios(Id),
        FechaLimite DATETIME2 NULL,
        Observaciones NVARCHAR(1000) NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_TramitesSAT_Estatus CHECK (Estatus IN ('Pendiente', 'EnProceso', 'EsperandoCliente', 'Completado', 'Cancelado'))
    );

    CREATE INDEX IX_TramitesSAT_ClienteId ON dbo.TramitesSAT(ClienteId);
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
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = 'erika@ecgabogados.com')
BEGIN
    INSERT INTO dbo.Usuarios (Email, PasswordHash, Nombre, Rol)
    VALUES ('erika@ecgabogados.com', '$2a$11$Bl1GymEymBs57HgpqaDZ/eGXwiGDXVPhHzaEYZ162epxfuQOw5Tt.', 'Erika Cruz García', 'Administrador');
END
GO

-- =========================================================
-- Seed: datos de ejemplo, claramente identificados (para poblar el dashboard).
-- =========================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE ClienteNombre = 'María Fernanda López' AND Tipo = 'Divorcio incausado')
BEGIN
    DECLARE @AbogadoId INT = (SELECT Id FROM dbo.Usuarios WHERE Email = 'erika@ecgabogados.com');

    INSERT INTO dbo.Casos (ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, AbogadoResponsableId, Prioridad, FolioInterno)
    VALUES
        ('María Fernanda López', 'Divorcio incausado', 'Activo', DATEADD(DAY, -30, SYSUTCDATETIME()), '[DATOS DE PRUEBA] Audiencia preliminar programada.',
            LOWER(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', '')), SYSUTCDATETIME(), @AbogadoId, 'Media', 'ECG-0001'),
        ('Carlos Alberto Ramírez', 'Custodia y pensión', 'Revision', DATEADD(DAY, -15, SYSUTCDATETIME()), '[DATOS DE PRUEBA] Pendiente de documentación adicional del cliente.',
            LOWER(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', '')), SYSUTCDATETIME(), @AbogadoId, 'Alta', 'ECG-0002');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Citas WHERE NombreCliente = 'María Fernanda López')
BEGIN
    DECLARE @CasoDivorcioId INT = (SELECT TOP 1 Id FROM dbo.Casos WHERE Tipo = 'Divorcio incausado' ORDER BY Id);
    DECLARE @CasoCustodiaId INT = (SELECT TOP 1 Id FROM dbo.Casos WHERE Tipo = 'Custodia y pensión' ORDER BY Id);

    INSERT INTO dbo.Citas (CasoId, NombreCliente, Telefono, FechaHora, Estatus)
    VALUES
        (@CasoDivorcioId, 'María Fernanda López', '5512345678', DATEADD(DAY, 2, SYSUTCDATETIME()), 'Confirmada'),
        (@CasoCustodiaId, 'Carlos Alberto Ramírez', '5598765432', DATEADD(DAY, 4, SYSUTCDATETIME()), 'Pendiente');
END
GO
