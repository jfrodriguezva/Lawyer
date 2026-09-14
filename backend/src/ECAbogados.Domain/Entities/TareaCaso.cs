namespace ECAbogados.Domain.Entities;

/// <summary>
/// Pendiente de trabajo interno sobre un caso (distinto de Plazo: un Plazo es
/// una fecha límite procesal/de audiencia; una Tarea es un encargo de trabajo
/// con un responsable, cumpla o no una fecha específica).
/// </summary>
public class TareaCaso
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public int? ResponsableUsuarioId { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    public bool Completada { get; set; }
    public DateTime FechaCreacion { get; set; }
}
