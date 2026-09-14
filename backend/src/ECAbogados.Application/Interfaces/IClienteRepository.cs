using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IClienteRepository : ICuentaSeguraRepository<Cliente>
{
    Task<Cliente?> GetByIdAsync(int id);
    Task<IReadOnlyList<Cliente>> GetAllAsync();
    Task<int> CreateAsync(Cliente cliente);
    Task SetActivoAsync(int id, bool activo);
}
