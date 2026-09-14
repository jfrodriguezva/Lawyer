namespace ECAbogados.Domain.Entities;

public enum DestinatarioTipo
{
    Usuario,
    Cliente
}

/// <summary>Centro de notificaciones interno (no es correo): se lee dentro del panel/portal.</summary>
public class Notificacion
{
    public int Id { get; set; }
    public DestinatarioTipo DestinatarioTipo { get; set; }
    public int DestinatarioId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public bool Leida { get; set; }
    public DateTime Fecha { get; set; }
    public string? Enlace { get; set; }
}
