using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface INotificacionRepository
{
    Task<int> CreateAsync(Notificacion notificacion);
    Task<IReadOnlyList<Notificacion>> GetByDestinatarioAsync(DestinatarioTipo tipo, int destinatarioId);
    Task<int> ContarNoLeidasAsync(DestinatarioTipo tipo, int destinatarioId);
    Task MarcarLeidaAsync(int id);
    Task MarcarTodasLeidasAsync(DestinatarioTipo tipo, int destinatarioId);
}
