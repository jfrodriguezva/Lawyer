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

-- sqlcmd conecta con QUOTED_IDENTIFIER apagado por defecto (a diferencia de
-- SSMS), y los índices filtrados (WHERE ...) de este script lo requieren
-- encendido para poder crearse.
SET QUOTED_IDENTIFIER ON;
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
-- Módulo = "categoría padre" del catálogo público de servicios (Abogado, SAT,
-- Comercializadora, y las que el Administrador agregue). RolResponsable indica
-- qué rol de Usuario atiende sus solicitudes: Abogado/Consultor siguen usando
-- el flujo de citas existente (SolicitudesCita.Modulo, sin cambios); Agente
-- todavía no tiene agenda formal, así que sus servicios solo ofrecen el
-- formulario de contacto simple (MensajesContacto). Activo=0 -> el sitio
-- muestra ese módulo como "Próximamente".
-- =========================================================
IF OBJECT_ID(N'dbo.Modulos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Modulos (
        Id INT IDENTITY PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Slug NVARCHAR(100) NOT NULL,
        RolResponsable NVARCHAR(50) NOT NULL,
        Activo BIT NOT NULL DEFAULT 1,
        Orden INT NOT NULL DEFAULT 0,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Modulos_RolResponsable CHECK (RolResponsable IN ('Abogado', 'Consultor', 'Agente'))
    );

    CREATE UNIQUE INDEX UX_Modulos_Slug ON dbo.Modulos(Slug);
END
GO

-- =========================================================
-- Servicio publicado en el sitio (antes hardcodeado en el frontend, en
-- lib/servicios.ts). Pertenece a un Modulo. Beneficios/Proceso se guardan
-- como JSON ([{ "icono"/"numero", "titulo", "texto" }, ...]) -- la app los
-- serializa/deserializa, evitando tablas hijas solo para listas cortas.
-- Tipo enlaza opcionalmente con el tipo de expediente en Casos (checklist
-- automático, ver Application/Casos/RequisitosPorTipo.cs); no es una FK, si
-- no coincide simplemente no dispara el checklist.
-- =========================================================
IF OBJECT_ID(N'dbo.Servicios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Servicios (
        Id INT IDENTITY PRIMARY KEY,
        ModuloId INT NOT NULL REFERENCES dbo.Modulos(Id),
        Slug NVARCHAR(150) NOT NULL,
        Titulo NVARCHAR(200) NOT NULL,
        Frase NVARCHAR(300) NULL,
        Descripcion NVARCHAR(1000) NOT NULL,
        Tipo NVARCHAR(150) NULL,
        Beneficios NVARCHAR(MAX) NOT NULL,
        Proceso NVARCHAR(MAX) NOT NULL,
        Activo BIT NOT NULL DEFAULT 1,
        Orden INT NOT NULL DEFAULT 0,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE UNIQUE INDEX UX_Servicios_Slug ON dbo.Servicios(Slug);
    CREATE INDEX IX_Servicios_ModuloId ON dbo.Servicios(ModuloId);
END
GO

-- =========================================================
-- Promociones: imagen + texto, asignable a uno o varios Servicios. Activo
-- controla si se muestra en el sitio público (banner del servicio + aviso en
-- el NavBar). RutaAlmacenamiento apunta a App_Data/promociones -- se sirve
-- solo a través de PromocionesController (igual que Documentos), nunca como
-- archivo estático.
-- =========================================================
IF OBJECT_ID(N'dbo.Promociones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Promociones (
        Id INT IDENTITY PRIMARY KEY,
        Texto NVARCHAR(1000) NOT NULL,
        NombreArchivo NVARCHAR(300) NOT NULL,
        TipoContenido NVARCHAR(150) NOT NULL,
        RutaAlmacenamiento NVARCHAR(500) NOT NULL,
        Activo BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.PromocionServicios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PromocionServicios (
        Id INT IDENTITY PRIMARY KEY,
        PromocionId INT NOT NULL REFERENCES dbo.Promociones(Id),
        ServicioId INT NOT NULL REFERENCES dbo.Servicios(Id)
    );

    CREATE INDEX IX_PromocionServicios_PromocionId ON dbo.PromocionServicios(PromocionId);
    CREATE UNIQUE INDEX UX_PromocionServicios_PromocionId_ServicioId ON dbo.PromocionServicios(PromocionId, ServicioId);
END
GO

-- =========================================================
-- Seed: Módulos y Servicios -- migra el catálogo que antes vivía hardcodeado
-- en frontend/web/lib/servicios.ts, para que el sitio no pierda contenido al
-- pasar a ser administrable desde el panel. Activo de SAT/Comercializadora
-- toma el valor que ya tenían los flags de dbo.Configuracion.
-- =========================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Modulos)
BEGIN
    INSERT INTO dbo.Modulos (Nombre, Slug, RolResponsable, Activo, Orden)
    VALUES
        ('Abogado', 'abogado', 'Abogado', 1, 10),
        ('SAT', 'sat', 'Consultor',
            (SELECT CASE WHEN Valor = 'true' THEN 1 ELSE 0 END FROM dbo.Configuracion WHERE Clave = 'sat_habilitado'), 20),
        ('Comercializadora', 'comercializadora', 'Agente',
            (SELECT CASE WHEN Valor = 'true' THEN 1 ELSE 0 END FROM dbo.Configuracion WHERE Clave = 'comercializadora_habilitada'), 30);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Servicios)
BEGIN
    INSERT INTO dbo.Servicios (Orden, ModuloId, Slug, Titulo, Frase, Descripcion, Tipo, Beneficios, Proceso)
    SELECT 10, m.Id, N'divorcio-incausado', N'Divorcio incausado', N'Tu libertad también es un derecho', N'¿Quieres divorciarte y tu pareja no está de acuerdo? En el divorcio incausado no necesitas su consentimiento, ni expresar una causa para solicitarlo. Te acompañamos en cada paso, de principio a fin.', N'Divorcio incausado', N'[{"icono":"gavel","titulo":"Sin consentimiento del otro","texto":"No necesitas que tu pareja esté de acuerdo ni firme nada para iniciar el proceso."},{"icono":"scale","titulo":"Asesoría personalizada","texto":"Analizamos tu situación particular antes de trazar la estrategia legal."},{"icono":"handHeart","titulo":"Acompañamiento total","texto":"Damos seguimiento a tu expediente desde el primer trámite hasta la sentencia."},{"icono":"family","titulo":"Protección familiar","texto":"Cuidamos tus derechos patrimoniales y los de tus hijas e hijos en todo momento."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Revisamos tu situación, resolvemos tus dudas y evaluamos la viabilidad de tu caso sin compromiso."},{"numero":"02","titulo":"Presentación de la demanda","texto":"Preparamos el expediente y lo presentamos ante el juzgado familiar, sin requerir la firma de la otra parte."},{"numero":"03","titulo":"Resolución y sentencia","texto":"Te acompañamos en cada audiencia hasta obtener tu sentencia de divorcio y regularizar tu situación legal."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 20, m.Id, N'divorcio-mutuo-consentimiento', N'Divorcio por mutuo consentimiento', N'Cuando ambos están de acuerdo, todo es más rápido', N'Si tú y tu pareja están de acuerdo en divorciarse, te ayudamos a integrar el convenio (bienes, custodia, pensión) y a llevar el trámite de la forma más ágil posible.', N'Divorcio por mutuo consentimiento', N'[{"icono":"clock","titulo":"Proceso más ágil","texto":"Al no haber controversia, el trámite suele resolverse en menos tiempo."},{"icono":"document","titulo":"Convenio a tu medida","texto":"Redactamos un convenio claro sobre bienes, custodia y pensión, evitando conflictos futuros."},{"icono":"scale","titulo":"Equilibrio para ambas partes","texto":"Buscamos un acuerdo justo que proteja los intereses de los dos."},{"icono":"handHeart","titulo":"Acompañamiento sin desgaste","texto":"Te guiamos en un proceso pensado para cerrar esta etapa en paz."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Revisamos su situación patrimonial y familiar para definir el contenido del convenio."},{"numero":"02","titulo":"Convenio y demanda","texto":"Redactamos el convenio y presentamos la solicitud conjunta ante el juzgado familiar."},{"numero":"03","titulo":"Resolución","texto":"Te acompañamos hasta obtener la sentencia que da por concluido el matrimonio."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 30, m.Id, N'pension-alimenticia', N'Pensión alimenticia', N'El derecho de tus hijos no espera', N'Te ayudamos con la solicitud, aumento, reducción o cancelación de la pensión alimenticia, así como con pensiones atrasadas y su cumplimiento, con un procedimiento claro y acompañamiento en cada audiencia.', N'Pensión alimenticia', N'[{"icono":"scale","titulo":"Cálculo justo","texto":"Analizamos ingresos y necesidades reales para proponer un monto justo."},{"icono":"document","titulo":"Seguimiento del pago","texto":"Te orientamos si el pago se incumple y sobre las medidas legales disponibles para cobrar atrasos."},{"icono":"family","titulo":"Protección de menores","texto":"Priorizamos siempre el bienestar de las hijas e hijos involucrados."},{"icono":"pin","titulo":"Presencial o en línea","texto":"Agenda tu asesoría como prefieras, sin necesidad de trasladarte si no puedes."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Revisamos tu situación económica y familiar para definir la estrategia."},{"numero":"02","titulo":"Presentación de la demanda","texto":"Integramos el expediente y lo presentamos ante el juzgado familiar."},{"numero":"03","titulo":"Resolución","texto":"Te acompañamos hasta obtener la fijación, el aumento, la reducción o el cumplimiento de la pensión."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 40, m.Id, N'custodia', N'Guarda y custodia', N'El bienestar de tus hijos, tu prioridad', N'Te representamos en procesos de guarda y custodia, asesorándote para determinar con quién vivirán los menores y proteger sus derechos, buscando siempre su mejor interés.', N'Custodia', N'[{"icono":"family","titulo":"Enfoque en el menor","texto":"La estrategia siempre se centra en el bienestar de las hijas e hijos."},{"icono":"scale","titulo":"Evaluación de tu caso","texto":"Analizamos tu situación de convivencia antes de trazar el camino legal."},{"icono":"handHeart","titulo":"Acompañamiento total","texto":"Te asesoramos desde la demanda hasta la resolución final."},{"icono":"lock","titulo":"Confidencialidad","texto":"Manejamos tu caso con total discreción y respeto."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Evaluamos la situación actual de convivencia y viabilidad del caso."},{"numero":"02","titulo":"Presentación de la demanda","texto":"Reunimos la documentación necesaria y presentamos la demanda ante el juzgado familiar."},{"numero":"03","titulo":"Resolución","texto":"Te acompañamos en cada audiencia hasta la sentencia."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 50, m.Id, N'regimen-de-visitas', N'Régimen de convivencias', N'Tiempo de calidad, garantizado por ley', N'Establecemos o modificamos el régimen de convivencias para garantizar tiempo de calidad con tus hijas e hijos, dentro de un marco legal claro.', N'Régimen de visitas', N'[{"icono":"document","titulo":"Acuerdos claros","texto":"Proponemos calendarios de convivencia realistas y respetuosos."},{"icono":"gavel","titulo":"Resolución de conflictos","texto":"Te apoyamos si el régimen actual no se está respetando."},{"icono":"clock","titulo":"Rapidez","texto":"Buscamos la vía más ágil posible para resolver tu situación."},{"icono":"handHeart","titulo":"Seguimiento cercano","texto":"Te acompañamos desde la solicitud hasta que el acuerdo quede vigente."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Revisamos tu situación actual de convivencia con tus hijas e hijos."},{"numero":"02","titulo":"Presentación de la solicitud","texto":"Integramos y presentamos la propuesta de régimen ante el juzgado."},{"numero":"03","titulo":"Resolución","texto":"Te acompañamos hasta que el régimen quede formalmente establecido."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 60, m.Id, N'sucesiones-herencias', N'Sucesiones y herencias', N'El legado de tu familia, en orden', N'Te acompañamos en juicios testamentarios e intestamentarios, para que la herencia se reparta conforme a la ley y sin conflictos innecesarios entre la familia.', N'Sucesiones y herencias', N'[{"icono":"document","titulo":"Trámite completo","texto":"Te guiamos desde la apertura de la sucesión hasta la adjudicación de bienes."},{"icono":"scale","titulo":"Con o sin testamento","texto":"Te asesoramos tanto en sucesiones testamentarias como intestamentarias."},{"icono":"family","titulo":"Cuidamos a la familia","texto":"Buscamos acuerdos que preserven la relación entre herederos."},{"icono":"handHeart","titulo":"Acompañamiento sensible","texto":"Entendemos que es un momento difícil y te asesoramos con cercanía."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Revisamos si existe testamento y la situación de los bienes y herederos."},{"numero":"02","titulo":"Integración del juicio","texto":"Reunimos la documentación necesaria e iniciamos el juicio sucesorio correspondiente."},{"numero":"03","titulo":"Adjudicación","texto":"Te acompañamos hasta la resolución que formaliza el reparto de la herencia."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 70, m.Id, N'cobranza-pagares', N'Cobranza y pagarés', N'Recupera lo que es tuyo', N'Te ayudamos a recuperar adeudos vencidos y a hacer valer pagarés mediante juicios mercantiles, con una estrategia clara para cobrar lo que se te debe.', N'Cobranza y pagarés', N'[{"icono":"money","titulo":"Recuperación de adeudos","texto":"Evaluamos la vía más efectiva para cobrar tu adeudo."},{"icono":"gavel","titulo":"Juicios mercantiles","texto":"Te representamos ante el juzgado si el deudor no paga voluntariamente."},{"icono":"document","titulo":"Revisión de tu título","texto":"Verificamos que tu pagaré o contrato sea exigible legalmente."},{"icono":"clock","titulo":"Estrategia ágil","texto":"Buscamos la vía más rápida posible según el monto y el deudor."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Revisamos el pagaré o contrato y la situación del deudor."},{"numero":"02","titulo":"Requerimiento o demanda","texto":"Iniciamos el cobro extrajudicial o presentamos la demanda mercantil."},{"numero":"03","titulo":"Cobro","texto":"Te acompañamos hasta lograr el pago o la ejecución de la sentencia."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 80, m.Id, N'contratos', N'Contratos', N'Que cada acuerdo te proteja', N'Elaboramos, revisamos y modificamos contratos para personas y empresas, cuidando que cada cláusula te proteja antes de que firmes.', N'Contratos', N'[{"icono":"document","titulo":"Elaboración a tu medida","texto":"Redactamos contratos claros, adaptados a tu operación o situación particular."},{"icono":"scale","titulo":"Revisión antes de firmar","texto":"Detectamos cláusulas riesgosas antes de que sea tarde."},{"icono":"gavel","titulo":"Modificación de contratos","texto":"Actualizamos acuerdos vigentes cuando las condiciones cambian."},{"icono":"clock","titulo":"Respuesta ágil","texto":"Entendemos que muchas veces necesitas el contrato listo con urgencia."}]', N'[{"numero":"01","titulo":"Diagnóstico","texto":"Entendemos qué necesitas proteger o formalizar."},{"numero":"02","titulo":"Elaboración o revisión","texto":"Redactamos o revisamos el contrato y te explicamos cada cláusula relevante."},{"numero":"03","titulo":"Firma","texto":"Te acompañamos hasta la firma, con las modificaciones ya incorporadas."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 90, m.Id, N'tramites-sat', N'Trámites ante el SAT', N'Tu situación fiscal, en manos expertas', N'¿Te llegó una carta del SAT o necesitas poner en orden tu situación fiscal? Te orientamos en declaraciones, devoluciones, constancias y regularización fiscal, para personas y negocios.', N'Trámites SAT', N'[{"icono":"calculator","titulo":"Declaraciones y devoluciones","texto":"Te apoyamos a presentar o corregir declaraciones y a gestionar devoluciones."},{"icono":"document","titulo":"Constancias y trámites","texto":"Te ayudamos a obtener constancias de situación fiscal y otros documentos ante el SAT."},{"icono":"briefcase","titulo":"Regularización fiscal","texto":"Diseñamos un plan para poner al día tu situación ante el fisco."},{"icono":"clock","titulo":"Atención oportuna","texto":"Respondemos con prioridad cuando hay plazos del SAT de por medio."}]', N'[{"numero":"01","titulo":"Revisión gratuita","texto":"Analizamos tu situación fiscal actual y el requerimiento o carta recibida, si aplica."},{"numero":"02","titulo":"Plan de acción","texto":"Te proponemos los trámites necesarios y los plazos a cumplir."},{"numero":"03","titulo":"Gestión y cierre","texto":"Damos seguimiento ante el SAT hasta resolver tu situación."}]' FROM dbo.Modulos m WHERE m.Slug = N'sat'
    UNION ALL
    SELECT 100, m.Id, N'asesoria-empresas', N'Asesoría legal para empresas y emprendedores', N'Blinda legalmente tu negocio', N'Acompañamos a empresas y emprendedores en contratos, prevención de riesgos y asuntos corporativos, para que tomes decisiones de negocio con respaldo legal.', N'Asesoría legal para empresas', N'[{"icono":"briefcase","titulo":"Asuntos corporativos","texto":"Te asesoramos en la constitución, gobierno y operación legal de tu empresa."},{"icono":"document","titulo":"Contratos comerciales","texto":"Elaboramos y revisamos los contratos que tu operación necesita."},{"icono":"scale","titulo":"Prevención de riesgos","texto":"Identificamos riesgos legales antes de que se conviertan en un problema."},{"icono":"clock","titulo":"Acompañamiento continuo","texto":"Te asesoramos de forma puntual o de manera continua, según lo que tu negocio necesite."}]', N'[{"numero":"01","titulo":"Diagnóstico legal","texto":"Revisamos la situación actual de tu empresa o proyecto."},{"numero":"02","titulo":"Plan de acción","texto":"Definimos qué contratos, políticas o trámites necesitas resolver primero."},{"numero":"03","titulo":"Implementación","texto":"Te acompañamos hasta dejar tu operación legalmente en orden."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado'
    UNION ALL
    SELECT 110, m.Id, N'violencia-familiar', N'Violencia familiar', N'No estás sola, no estás solo', N'Te acompañamos con seriedad y confidencialidad en procesos por violencia familiar, incluyendo medidas de protección para ti y tu familia.', N'Violencia familiar', N'[{"icono":"clock","titulo":"Atención inmediata","texto":"Respondemos con prioridad ante situaciones de riesgo."},{"icono":"gavel","titulo":"Medidas de protección","texto":"Te orientamos sobre las órdenes de protección disponibles."},{"icono":"lock","titulo":"Confidencialidad total","texto":"Tu caso se maneja con la máxima discreción."},{"icono":"handHeart","titulo":"Acompañamiento humano","texto":"Te escuchamos y te guiamos en cada paso, sin juicios."}]', N'[{"numero":"01","titulo":"Asesoría inicial","texto":"Escuchamos tu situación y evaluamos las medidas urgentes necesarias."},{"numero":"02","titulo":"Medidas y denuncia","texto":"Te apoyamos a solicitar medidas de protección y, si procede, a denunciar."},{"numero":"03","titulo":"Resolución","texto":"Te acompañamos en el proceso legal hasta su conclusión."}]' FROM dbo.Modulos m WHERE m.Slug = N'abogado';
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
