namespace ECAbogados.Domain.Entities;

public enum VisibilidadActualizacion
{
    Interna,
    Compartida
}

/// <summary>
/// Nota de avance de un Caso. Las Internas nunca se exponen al portal del
/// Cliente; las Compartidas sí. Nunca reutilizar Notas internas para esto.
/// </summary>
public class ActualizacionCaso
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public string Texto { get; set; } = string.Empty;
    public VisibilidadActualizacion Visibilidad { get; set; }
    public int UsuarioId { get; set; }
    public string? UsuarioNombre { get; set; }
    public DateTime Fecha { get; set; }
}
