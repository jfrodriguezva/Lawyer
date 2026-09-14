namespace ECAbogados.Domain.Entities;

public enum EtapaProspecto
{
    Nuevo,
    EnRevision,
    EntrevistaRealizada,
    Contratado,
    NoContratado
}

public enum EstatusConflictoInteres
{
    Pendiente,
    Revisado,
    Autorizado,
    Rechazado
}

/// <summary>
/// Expediente de un interesado que aún no es Cliente. Se crea automáticamente
/// a partir de la primera SolicitudCita (si el correo no pertenece ya a un
/// Cliente) y se convierte en Cliente cuando se concreta la contratación.
/// </summary>
public class Prospecto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string? MedioContactoPreferido { get; set; }
    public string? Origen { get; set; }
    public string? ServicioInteres { get; set; }
    public EstatusConflictoInteres ConflictoInteres { get; set; } = EstatusConflictoInteres.Pendiente;
    public int? ResponsableUsuarioId { get; set; }
    public string? ResultadoEntrevista { get; set; }
    public EtapaProspecto Etapa { get; set; } = EtapaProspecto.Nuevo;
    public string? MotivoNoContratacion { get; set; }
    public int? ClienteId { get; set; }
    public DateTime FechaCreacion { get; set; }
}
