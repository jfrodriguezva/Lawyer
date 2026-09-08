using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

/// <summary>Repositorio en memoria para pruebas — sin librerías de mocking.</summary>
public class FakeUsuarioRepository : IUsuarioRepository
{
    private readonly List<Usuario> _usuarios = [];
    private int _nextId = 1;

    public void Seed(Usuario usuario)
    {
        usuario.Id = _nextId++;
        _usuarios.Add(usuario);
    }

    public Task<Usuario?> GetByEmailAsync(string email) =>
        Task.FromResult(_usuarios.FirstOrDefault(u => u.Email == email));

    public Task<IReadOnlyList<Usuario>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<Usuario>>(_usuarios.ToList());

    public Task<int> CreateAsync(Usuario usuario)
    {
        usuario.Id = _nextId++;
        _usuarios.Add(usuario);
        return Task.FromResult(usuario.Id);
    }

    public Task SetActivoAsync(int id, bool activo)
    {
        var usuario = _usuarios.First(u => u.Id == id);
        usuario.Activo = activo;
        return Task.CompletedTask;
    }
}
