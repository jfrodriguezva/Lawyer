using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IProspectoRepository
{
    Task<Prospecto?> GetByEmailAsync(string email);
    Task<Prospecto?> GetByIdAsync(int id);
    Task<IReadOnlyList<Prospecto>> GetAllAsync();
    Task<int> CreateAsync(Prospecto prospecto);
    Task UpdateAsync(Prospecto prospecto);
    Task VincularClienteAsync(int prospectoId, int clienteId);
}
