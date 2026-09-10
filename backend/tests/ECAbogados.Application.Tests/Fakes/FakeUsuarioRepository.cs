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

    public Task UpdateAsync(Usuario usuario)
    {
        var existente = _usuarios.First(u => u.Id == usuario.Id);
        existente.Nombre = usuario.Nombre;
        existente.Rol = usuario.Rol;
        return Task.CompletedTask;
    }

    public Task UpdatePasswordHashAsync(int id, string passwordHash)
    {
        _usuarios.First(u => u.Id == id).PasswordHash = passwordHash;
        return Task.CompletedTask;
    }

    public Task UpdateSeguridadLoginAsync(int id, int intentosFallidos, DateTime? bloqueadoHasta)
    {
        var usuario = _usuarios.First(u => u.Id == id);
        usuario.IntentosFallidos = intentosFallidos;
        usuario.BloqueadoHasta = bloqueadoHasta;
        return Task.CompletedTask;
    }

    public Task SetResetTokenAsync(int id, string? resetToken, DateTime? resetTokenExpira)
    {
        var usuario = _usuarios.First(u => u.Id == id);
        usuario.ResetToken = resetToken;
        usuario.ResetTokenExpira = resetTokenExpira;
        return Task.CompletedTask;
    }

    public Task<Usuario?> GetByResetTokenAsync(string resetToken) =>
        Task.FromResult(_usuarios.FirstOrDefault(u => u.ResetToken == resetToken));
}
