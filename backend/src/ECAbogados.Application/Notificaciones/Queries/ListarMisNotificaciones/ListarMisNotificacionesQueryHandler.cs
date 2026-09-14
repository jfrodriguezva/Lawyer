using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Notificaciones.Queries.ListarMisNotificaciones;

public class ListarMisNotificacionesQueryHandler(INotificacionRepository notificacionRepository)
    : IRequestHandler<ListarMisNotificacionesQuery, IReadOnlyList<NotificacionDto>>
{
    public async Task<IReadOnlyList<NotificacionDto>> Handle(ListarMisNotificacionesQuery request, CancellationToken cancellationToken)
    {
        var notificaciones = await notificacionRepository.GetByDestinatarioAsync(request.Tipo, request.DestinatarioId);

        return notificaciones
            .Select(n => new NotificacionDto(n.Id, n.Titulo, n.Mensaje, n.Leida, n.Fecha, n.Enlace))
            .ToList();
    }
}
