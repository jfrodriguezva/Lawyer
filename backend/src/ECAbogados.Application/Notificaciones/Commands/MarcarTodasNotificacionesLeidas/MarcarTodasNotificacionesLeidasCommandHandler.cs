using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Notificaciones.Commands.MarcarTodasNotificacionesLeidas;

public class MarcarTodasNotificacionesLeidasCommandHandler(INotificacionRepository notificacionRepository) : IRequestHandler<MarcarTodasNotificacionesLeidasCommand>
{
    public Task Handle(MarcarTodasNotificacionesLeidasCommand request, CancellationToken cancellationToken) =>
        notificacionRepository.MarcarTodasLeidasAsync(request.Tipo, request.DestinatarioId);
}
