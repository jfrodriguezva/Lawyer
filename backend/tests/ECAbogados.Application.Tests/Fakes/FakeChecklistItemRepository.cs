using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeChecklistItemRepository : IChecklistItemRepository
{
    private readonly List<ChecklistItem> _items = [];
    private int _nextId = 1;

    public Task<IReadOnlyList<ChecklistItem>> GetByCasoIdAsync(int casoId) =>
        Task.FromResult<IReadOnlyList<ChecklistItem>>(_items.Where(i => i.CasoId == casoId).ToList());

    public Task CreateManyAsync(int casoId, IEnumerable<string> descripciones)
    {
        foreach (var descripcion in descripciones)
        {
            _items.Add(new ChecklistItem { Id = _nextId++, CasoId = casoId, Descripcion = descripcion, Completado = false });
        }

        return Task.CompletedTask;
    }

    public Task SetCompletadoAsync(int id, bool completado)
    {
        var item = _items.First(i => i.Id == id);
        item.Completado = completado;
        return Task.CompletedTask;
    }
}
