using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeNotificacionRepository : INotificacionRepository
{
    public List<Notificacion> Notificaciones { get; } = [];
    private int _nextId = 1;

    public Task<int> CreateAsync(Notificacion notificacion)
    {
        notificacion.Id = _nextId++;
        Notificaciones.Add(notificacion);
        return Task.FromResult(notificacion.Id);
    }

    public Task<IReadOnlyList<Notificacion>> GetByDestinatarioAsync(DestinatarioTipo tipo, int destinatarioId) =>
        Task.FromResult<IReadOnlyList<Notificacion>>(
            Notificaciones.Where(n => n.DestinatarioTipo == tipo && n.DestinatarioId == destinatarioId).ToList());

    public Task<int> ContarNoLeidasAsync(DestinatarioTipo tipo, int destinatarioId) =>
        Task.FromResult(Notificaciones.Count(n => n.DestinatarioTipo == tipo && n.DestinatarioId == destinatarioId && !n.Leida));

    public Task MarcarLeidaAsync(int id)
    {
        var notificacion = Notificaciones.FirstOrDefault(n => n.Id == id);
        if (notificacion is not null) notificacion.Leida = true;
        return Task.CompletedTask;
    }

    public Task MarcarTodasLeidasAsync(DestinatarioTipo tipo, int destinatarioId)
    {
        foreach (var n in Notificaciones.Where(n => n.DestinatarioTipo == tipo && n.DestinatarioId == destinatarioId))
        {
            n.Leida = true;
        }
        return Task.CompletedTask;
    }
}
