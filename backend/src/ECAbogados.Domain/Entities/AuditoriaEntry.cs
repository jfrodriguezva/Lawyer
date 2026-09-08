namespace ECAbogados.Domain.Entities;

public class AuditoriaEntry
{
    public int Id { get; set; }
    public string Entidad { get; set; } = string.Empty;
    public int EntidadId { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string? Detalle { get; set; }
    public int? UsuarioId { get; set; }
    public string? UsuarioNombre { get; set; }
    public DateTime Fecha { get; set; }
}
