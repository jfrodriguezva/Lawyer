using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IUsuarioRepository : ICuentaSeguraRepository<Usuario>
{
    Task<Usuario?> GetByIdAsync(int id);
    Task<IReadOnlyList<Usuario>> GetAllAsync();
    Task<int> CreateAsync(Usuario usuario);
    Task SetActivoAsync(int id, bool activo);
    Task UpdateAsync(Usuario usuario);
}
