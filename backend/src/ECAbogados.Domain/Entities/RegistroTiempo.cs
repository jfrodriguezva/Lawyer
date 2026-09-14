namespace ECAbogados.Domain.Entities;

/// <summary>Minutos dedicados por un Usuario a un Caso, para reportes de carga de trabajo.</summary>
public class RegistroTiempo
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public int UsuarioId { get; set; }
    public string? UsuarioNombre { get; set; }
    public int Minutos { get; set; }
    public string? Descripcion { get; set; }
    public DateTime Fecha { get; set; }
}
