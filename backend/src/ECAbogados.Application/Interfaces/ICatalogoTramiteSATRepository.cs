using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ICatalogoTramiteSATRepository
{
    Task<IReadOnlyList<CatalogoTramiteSAT>> GetAllAsync();
    Task<CatalogoTramiteSAT?> GetByIdAsync(int id);
    Task<int> CreateAsync(CatalogoTramiteSAT tramite);
    Task UpdateAsync(CatalogoTramiteSAT tramite);
    Task SetActivoAsync(int id, bool activo);
}
