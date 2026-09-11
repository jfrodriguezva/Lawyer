using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

/// <summary>Repositorio en memoria para pruebas — sin librerías de mocking.</summary>
public class FakeClienteRepository : IClienteRepository
{
    private readonly List<Cliente> _clientes = [];
    private int _nextId = 1;

    public void Seed(Cliente cliente)
    {
        cliente.Id = _nextId++;
        _clientes.Add(cliente);
    }

    public Task<Cliente?> GetByEmailAsync(string email) =>
        Task.FromResult(_clientes.FirstOrDefault(c => c.Email == email));

    public Task<Cliente?> GetByIdAsync(int id) =>
        Task.FromResult(_clientes.FirstOrDefault(c => c.Id == id));

    public Task<IReadOnlyList<Cliente>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<Cliente>>(_clientes.ToList());

    public Task<int> CreateAsync(Cliente cliente)
    {
        cliente.Id = _nextId++;
        _clientes.Add(cliente);
        return Task.FromResult(cliente.Id);
    }

    public Task SetActivoAsync(int id, bool activo)
    {
        _clientes.First(c => c.Id == id).Activo = activo;
        return Task.CompletedTask;
    }

    public Task UpdateSeguridadLoginAsync(int id, int intentosFallidos, DateTime? bloqueadoHasta)
    {
        var cliente = _clientes.First(c => c.Id == id);
        cliente.IntentosFallidos = intentosFallidos;
        cliente.BloqueadoHasta = bloqueadoHasta;
        return Task.CompletedTask;
    }
}
