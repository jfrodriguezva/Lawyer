using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ICasoRepository
{
    Task<IReadOnlyList<Caso>> GetAllAsync();
    Task<(IReadOnlyList<Caso> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search);
    Task<Caso?> GetByIdAsync(int id);
    Task<Caso?> GetByTokenAsync(string token);
    Task<IReadOnlyList<Caso>> GetByClienteIdAsync(int clienteId);
    Task<int> CreateAsync(Caso caso);
    Task UpdateAsync(Caso caso);
    Task<string> RegenerarTokenAsync(int id);
    Task VincularClienteAsync(int casoId, int clienteId);
}
