namespace ECAbogados.Domain.Entities;

/// <summary>
/// "Categoría padre" del catálogo público de servicios (Abogado, SAT,
/// Comercializadora, y cualquier otra que el Administrador agregue).
/// RolResponsable indica qué rol de Usuario atiende las solicitudes de sus
/// Servicios: Abogado/Consultor siguen el flujo de citas existente
/// (SolicitudesCita.Modulo); Agente todavía no tiene agenda formal, así que
/// sus servicios solo ofrecen el formulario de contacto simple.
/// </summary>
public class Modulo
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string RolResponsable { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
    public int Orden { get; set; }
}

public static class RolesResponsablesModulo
{
    public const string Abogado = "Abogado";
    public const string Consultor = "Consultor";
    public const string Agente = "Agente";

    public static readonly string[] Validos = [Abogado, Consultor, Agente];
}
