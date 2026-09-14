namespace ECAbogados.Domain.Entities;

/// <summary>
/// Catálogo de roles de Usuario (staff). "Asistente" se eliminó: Abogado es hoy
/// el rol operativo único del módulo jurídico (puede haber varios usuarios con
/// este rol a futuro, aunque hoy solo exista uno). Consultor y Agente quedan
/// reservados para los módulos SAT y Comercializadora respectivamente.
/// </summary>
public static class Roles
{
    public const string Abogado = "Abogado";
    public const string Consultor = "Consultor";
    public const string Agente = "Agente";
    public const string Administrador = "Administrador";

    public static readonly string[] Validos = [Abogado, Consultor, Agente, Administrador];
}
