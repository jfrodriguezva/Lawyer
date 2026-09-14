namespace ECAbogados.Domain.Entities;

/// <summary>
/// Contrato común entre Usuario (staff) y Cliente (portal): las dos entidades
/// que inician sesión con el mismo mecanismo de bloqueo por intentos fallidos
/// y el mismo mecanismo de token de un solo uso (recuperación de contraseña
/// e invitación de acceso comparten la misma implementación).
/// </summary>
public interface ICuentaSegura
{
    int Id { get; }
    string Email { get; }
    string Nombre { get; }
    string PasswordHash { get; }
    bool Activo { get; }
    int IntentosFallidos { get; }
    DateTime? BloqueadoHasta { get; }
    string? ResetToken { get; }
    DateTime? ResetTokenExpira { get; }
}
