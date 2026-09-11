using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IClienteRepository
{
    Task<Cliente?> GetByEmailAsync(string email);
    Task<Cliente?> GetByIdAsync(int id);
    Task<IReadOnlyList<Cliente>> GetAllAsync();
    Task<int> CreateAsync(Cliente cliente);
    Task SetActivoAsync(int id, bool activo);
    Task UpdateSeguridadLoginAsync(int id, int intentosFallidos, DateTime? bloqueadoHasta);
}
