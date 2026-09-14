using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeActualizacionCasoRepository : IActualizacionCasoRepository
{
    private readonly List<ActualizacionCaso> _actualizaciones = [];
    private int _nextId = 1;

    public Task<IReadOnlyList<ActualizacionCaso>> GetByCasoIdAsync(int casoId) =>
        Task.FromResult<IReadOnlyList<ActualizacionCaso>>(_actualizaciones.Where(a => a.CasoId == casoId).ToList());

    public Task<int> CreateAsync(ActualizacionCaso actualizacion)
    {
        actualizacion.Id = _nextId++;
        _actualizaciones.Add(actualizacion);
        return Task.FromResult(actualizacion.Id);
    }
}
