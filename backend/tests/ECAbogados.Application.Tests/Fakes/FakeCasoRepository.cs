using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeCasoRepository : ICasoRepository
{
    private readonly List<Caso> _casos = [];
    private int _nextId = 1;

    public void Seed(Caso caso)
    {
        caso.Id = _nextId++;
        _casos.Add(caso);
    }

    public Task<IReadOnlyList<Caso>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<Caso>>(_casos.ToList());

    public Task<(IReadOnlyList<Caso> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search)
    {
        var filtrados = string.IsNullOrWhiteSpace(search)
            ? _casos
            : _casos.Where(c =>
                c.ClienteNombre.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                c.Tipo.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();

        var items = filtrados.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Task.FromResult<(IReadOnlyList<Caso>, int)>((items, filtrados.Count));
    }

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
