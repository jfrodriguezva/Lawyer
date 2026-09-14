namespace ECAbogados.Domain.Entities;

public enum EstatusCaso
{
    Activo,
    Revision,
    Cerrado
}

public class Caso
{
    public int Id { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public EstatusCaso Estatus { get; set; }
    public DateTime FechaApertura { get; set; }
    public string? Notas { get; set; }
    public string? TokenAcceso { get; set; }
    public DateTime? TokenGeneradoEn { get; set; }
    public int? ClienteId { get; set; }

    // Un caso pertenece a un cliente pero puede tener varios casos por cliente
    // (multi-caso). El despacho opera con un único Abogado responsable por
    // caso (no multi-abogado); el campo admite varios Abogados en el sistema.
    public int? AbogadoResponsableId { get; set; }
    public string? Prioridad { get; set; }
    public string? FolioInterno { get; set; }
    public string? ContraparteNombre { get; set; }
    public string? AutoridadOrganismo { get; set; }
    public string? NumeroExpedienteExterno { get; set; }
    public DateTime? FechaCierre { get; set; }
    public string? MotivoCierre { get; set; }
    public bool Archivado { get; set; }

    // Honorarios: monto total acordado con el cliente (si se definió), para
    // poder calcular saldo pendiente contra los Pagos registrados. Nunca se
    // infiere ni se calcula automáticamente: lo captura el Abogado si aplica.
    public decimal? MontoAcordado { get; set; }
}
