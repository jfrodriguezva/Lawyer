namespace ECAbogados.Application.Interfaces;

/// <summary>
/// Da acceso al usuario autenticado de la solicitud actual (o null si es una ruta
/// anónima) sin que Application dependa de ASP.NET Core.
/// </summary>
public interface ICurrentUserAccessor
{
    int? UsuarioId { get; }
    string? Nombre { get; }
}
