using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeMensajeContactoRepository : IMensajeContactoRepository
{
    private readonly List<MensajeContacto> _mensajes = [];
    private int _nextId = 1;

    public void Seed(MensajeContacto mensaje)
    {
        mensaje.Id = _nextId++;
        _mensajes.Add(mensaje);
    }

    public Task<IReadOnlyList<MensajeContacto>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<MensajeContacto>>(_mensajes.ToList());

    public Task<(IReadOnlyList<MensajeContacto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize) =>
        Task.FromResult<(IReadOnlyList<MensajeContacto>, int)>(
            (_mensajes.Skip((page - 1) * pageSize).Take(pageSize).ToList(), _mensajes.Count));

    public Task<int> CreateAsync(MensajeContacto mensaje)
    {
        Seed(mensaje);
        return Task.FromResult(mensaje.Id);
    }

    public Task MarcarAtendidoAsync(int id)
    {
        _mensajes.First(m => m.Id == id).Atendido = true;
        return Task.CompletedTask;
    }

    public Task<(int Total, int Atendidos)> GetConteoAtendidosAsync() =>
        Task.FromResult((_mensajes.Count, _mensajes.Count(m => m.Atendido)));
}
