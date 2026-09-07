namespace ECAbogados.Domain.Entities;

public class MensajeContacto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public DateTime FechaEnvio { get; set; }
    public bool Atendido { get; set; }
}
