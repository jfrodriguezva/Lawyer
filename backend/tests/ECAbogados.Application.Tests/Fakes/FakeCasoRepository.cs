using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeCasoRepository : ICasoRepository
{
    private readonly List<Caso> _casos = [];
    private int _nextId = 1;

    public Task<IReadOnlyList<Caso>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<Caso>>(_casos.ToList());

    public Task<Caso?> GetByIdAsync(int id) =>
        Task.FromResult(_casos.FirstOrDefault(c => c.Id == id));

    public Task<Caso?> GetByTokenAsync(string token) =>
        Task.FromResult(_casos.FirstOrDefault(c => c.TokenAcceso == token));

    public Task<int> CreateAsync(Caso caso)
    {
        caso.Id = _nextId++;
        _casos.Add(caso);
        return Task.FromResult(caso.Id);
    }

    public Task UpdateAsync(Caso caso)
    {
        var existente = _casos.First(c => c.Id == caso.Id);
        existente.ClienteNombre = caso.ClienteNombre;
        existente.Tipo = caso.Tipo;
        existente.Estatus = caso.Estatus;
        existente.Notas = caso.Notas;
        return Task.CompletedTask;
    }

    public Task<string> RegenerarTokenAsync(int id)
    {
        var caso = _casos.First(c => c.Id == id);
        caso.TokenAcceso = Guid.NewGuid().ToString("N");
        caso.TokenGeneradoEn = DateTime.UtcNow;
        return Task.FromResult(caso.TokenAcceso);
    }
}
