namespace ECAbogados.Domain.Entities;

/// <summary>
/// A qué módulo pertenece la solicitud. SAT existe en el modelo desde ahora
/// para no romper el esquema después, pero el flujo/rol Consultor que la
/// atiende se activa en una fase posterior (ver Configuracion "sat_habilitado").
/// </summary>
public enum ModuloSolicitud
{
    Abogado,
    SAT
}

public enum ModalidadCita
{
    Presencial,
    Videollamada,
    Llamada
}

public enum EstatusSolicitudCita
{
    SolicitudRecibida,
    EnRevision,
    InformacionRequerida,
    HorarioAlternativoPropuesto,
    PendienteConfirmacionSolicitante,
    Confirmada,
    Realizada,
    Cancelada,
    NoAsistio,
    Rechazada,
    ConvertidaEnContratacion
}

/// <summary>
/// Negociación de fecha/hora entre quien solicita una cita y el despacho.
/// Al confirmarse (Estatus = Confirmada) se crea una Cita real en el calendario.
/// </summary>
public class SolicitudCita
{
    public int Id { get; set; }
    public int? ProspectoId { get; set; }
    public int? ClienteId { get; set; }
    public string NombreSolicitante { get; set; } = string.Empty;
    public string EmailSolicitante { get; set; } = string.Empty;
    public string TelefonoSolicitante { get; set; } = string.Empty;
    public string? MedioContactoPreferido { get; set; }
    public ModuloSolicitud Modulo { get; set; }
    public string? ServicioInteres { get; set; }
    public string? Descripcion { get; set; }
    public DateTime FechaHoraPropuesta { get; set; }
    public ModalidadCita Modalidad { get; set; }
    public EstatusSolicitudCita Estatus { get; set; } = EstatusSolicitudCita.SolicitudRecibida;
    public int? ResponsableUsuarioId { get; set; }
    public string? Motivo { get; set; }
    public int? CitaId { get; set; }
    public DateTime FechaCreacion { get; set; }

    // Enlace público de un solo propósito (como el TokenAcceso de Caso) para que
    // el solicitante pueda responder a una propuesta de horario sin necesidad de
    // cuenta ni de adivinar el Id de su solicitud.
    public string TokenPublico { get; set; } = string.Empty;

    // Registro de consentimiento del aviso de privacidad, capturado en el
    // mismo momento en que se envía la solicitud (paso 4 del formulario público).
    public bool AceptoAvisoPrivacidad { get; set; }
    public DateTime? FechaConsentimiento { get; set; }
}

public enum OrigenCambioCita
{
    Staff,
    Solicitante
}

/// <summary>Historial de cada propuesta de fecha/hora dentro de una SolicitudCita.</summary>
public class HistorialCitaCambio
{
    public int Id { get; set; }
    public int SolicitudCitaId { get; set; }
    public DateTime FechaHoraPropuesta { get; set; }
    public OrigenCambioCita PropuestoPor { get; set; }
    public string? Motivo { get; set; }
    public DateTime Fecha { get; set; }
}
