using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Notificaciones.Commands.MarcarNotificacionLeida;

public class MarcarNotificacionLeidaCommandHandler(INotificacionRepository notificacionRepository) : IRequestHandler<MarcarNotificacionLeidaCommand>
{
    public Task Handle(MarcarNotificacionLeidaCommand request, CancellationToken cancellationToken) =>
        notificacionRepository.MarcarLeidaAsync(request.Id);
}
