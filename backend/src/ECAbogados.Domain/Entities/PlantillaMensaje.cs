namespace ECAbogados.Domain.Entities;

/// <summary>Texto reutilizable para WhatsApp/correo (ej. "Recordatorio de cita", "Solicitud de documentos").</summary>
public class PlantillaMensaje
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Contenido { get; set; } = string.Empty;
}
