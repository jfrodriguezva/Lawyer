namespace ECAbogados.Domain.Entities;

public enum EstatusTramiteSAT
{
    Pendiente,
    EnProceso,
    EsperandoCliente,
    Completado,
    Cancelado
}

/// <summary>
/// Seguimiento administrativo de un trámite SAT concreto de un Cliente, a
/// partir de una entrada del CatalogoTramiteSAT. Es exclusivamente informativo:
/// nunca guarda contraseñas del SAT ni e.firma.
/// </summary>
public class TramiteSAT
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public int CatalogoTramiteId { get; set; }
    public EstatusTramiteSAT Estatus { get; set; } = EstatusTramiteSAT.Pendiente;
    public int? ResponsableUsuarioId { get; set; }
    public DateTime? FechaLimite { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; }
}
