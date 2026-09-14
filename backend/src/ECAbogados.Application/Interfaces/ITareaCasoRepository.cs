using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ITareaCasoRepository
{
    Task<IReadOnlyList<TareaCaso>> GetByCasoIdAsync(int casoId);
    Task<IReadOnlyList<TareaCaso>> GetPendientesAsync();
    Task<int> CreateAsync(TareaCaso tarea);
    Task SetCompletadaAsync(int id, bool completada);
}
