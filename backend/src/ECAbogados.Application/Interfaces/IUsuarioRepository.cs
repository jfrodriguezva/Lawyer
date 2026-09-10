using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<IReadOnlyList<Usuario>> GetAllAsync();
    Task<int> CreateAsync(Usuario usuario);
    Task SetActivoAsync(int id, bool activo);
    Task UpdateAsync(Usuario usuario);
    Task UpdatePasswordHashAsync(int id, string passwordHash);
    Task UpdateSeguridadLoginAsync(int id, int intentosFallidos, DateTime? bloqueadoHasta);
    Task SetResetTokenAsync(int id, string? resetToken, DateTime? resetTokenExpira);
    Task<Usuario?> GetByResetTokenAsync(string resetToken);
}
