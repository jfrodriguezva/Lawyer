using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ITramiteSATRepository
{
    Task<IReadOnlyList<TramiteSAT>> GetAllAsync();
    Task<IReadOnlyList<TramiteSAT>> GetByClienteIdAsync(int clienteId);
    Task<TramiteSAT?> GetByIdAsync(int id);
    Task<int> CreateAsync(TramiteSAT tramite);
    Task UpdateAsync(TramiteSAT tramite);
}
