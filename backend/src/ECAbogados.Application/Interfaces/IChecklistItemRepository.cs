using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IChecklistItemRepository
{
    Task<IReadOnlyList<ChecklistItem>> GetByCasoIdAsync(int casoId);
    Task CreateManyAsync(int casoId, IEnumerable<string> descripciones);
    Task SetCompletadoAsync(int id, bool completado);
}
