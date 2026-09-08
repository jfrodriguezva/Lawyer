using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ICasoRepository
{
    Task<IReadOnlyList<Caso>> GetAllAsync();
    Task<Caso?> GetByIdAsync(int id);
    Task<Caso?> GetByTokenAsync(string token);
    Task<int> CreateAsync(Caso caso);
    Task UpdateAsync(Caso caso);
    Task<string> RegenerarTokenAsync(int id);
}
