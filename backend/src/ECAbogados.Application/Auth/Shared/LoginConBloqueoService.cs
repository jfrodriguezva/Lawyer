using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Auth.Shared;

/// <summary>
/// Lógica de autenticación con bloqueo por intentos fallidos, compartida entre
/// el login de Usuario (staff) y de Cliente (portal) para no duplicar la regla
/// de negocio (5 intentos -> bloqueo de 15 minutos) en dos handlers idénticos.
/// </summary>
public static class LoginConBloqueoService
{
    private const int MaxIntentosFallidos = 5;
    private static readonly TimeSpan DuracionBloqueo = TimeSpan.FromMinutes(15);

    public static async Task<T> AutenticarAsync<T>(
        ICuentaSeguraRepository<T> repository,
        IPasswordHasher passwordHasher,
        string email,
        string password) where T : class, ICuentaSegura
    {
        var cuenta = await repository.GetByEmailAsync(email);

        if (cuenta is null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (cuenta.BloqueadoHasta is not null && cuenta.BloqueadoHasta > DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException(
                "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en unos minutos.");
        }

        if (!passwordHasher.Verify(password, cuenta.PasswordHash))
        {
            var intentos = cuenta.IntentosFallidos + 1;
            DateTime? bloqueadoHasta = null;

            if (intentos >= MaxIntentosFallidos)
            {
                bloqueadoHasta = DateTime.UtcNow.Add(DuracionBloqueo);
                intentos = 0; // al desbloquearse, empieza con el contador limpio
            }

            await repository.UpdateSeguridadLoginAsync(cuenta.Id, intentos, bloqueadoHasta);

            throw bloqueadoHasta is not null
                ? new UnauthorizedAccessException(
                    "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en unos minutos.")
                : new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (!cuenta.Activo)
        {
            // Mismo mensaje que credenciales inválidas: no revelar que la cuenta existe pero está desactivada.
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (cuenta.IntentosFallidos != 0 || cuenta.BloqueadoHasta is not null)
        {
            await repository.UpdateSeguridadLoginAsync(cuenta.Id, 0, null);
        }

        return cuenta;
    }
}
