using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Auth.Shared;

/// <summary>
/// Genera y consume tokens de un solo uso sobre ICuentaSegura. Se usa tanto
/// para "olvidé mi contraseña" (Usuario y Cliente) como para la invitación
/// segura de acceso a un Cliente recién convertido: ambos flujos son, a nivel
/// de datos, "dale a esta cuenta un token temporal para fijar su contraseña".
/// </summary>
public static class PasswordResetService
{
    public static async Task<string> GenerarTokenAsync<T>(
        ICuentaSeguraRepository<T> repository, int cuentaId, TimeSpan vigencia) where T : class, ICuentaSegura
    {
        var token = Guid.NewGuid().ToString("N");
        await repository.SetResetTokenAsync(cuentaId, token, DateTime.UtcNow.Add(vigencia));
        return token;
    }

    public static async Task RestablecerAsync<T>(
        ICuentaSeguraRepository<T> repository,
        IPasswordHasher passwordHasher,
        string token,
        string nuevaPassword) where T : class, ICuentaSegura
    {
        var cuenta = await repository.GetByResetTokenAsync(token);

        if (cuenta is null || cuenta.ResetTokenExpira is null || cuenta.ResetTokenExpira < DateTime.UtcNow)
        {
            throw new InvalidOperationException("El enlace no es válido o ya expiró.");
        }

        await repository.UpdatePasswordHashAsync(cuenta.Id, passwordHasher.Hash(nuevaPassword));
        await repository.SetResetTokenAsync(cuenta.Id, null, null);
        await repository.UpdateSeguridadLoginAsync(cuenta.Id, 0, null);
    }
}
