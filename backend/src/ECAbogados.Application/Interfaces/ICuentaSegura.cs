using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ICuentaSeguraRepository<T> where T : ICuentaSegura
{
    Task<T?> GetByEmailAsync(string email);
    Task UpdateSeguridadLoginAsync(int id, int intentosFallidos, DateTime? bloqueadoHasta);
    Task<T?> GetByResetTokenAsync(string resetToken);
    Task SetResetTokenAsync(int id, string? resetToken, DateTime? resetTokenExpira);
    Task UpdatePasswordHashAsync(int id, string passwordHash);
}
