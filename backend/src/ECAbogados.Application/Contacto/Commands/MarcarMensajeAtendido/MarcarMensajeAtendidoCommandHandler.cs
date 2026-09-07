using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Commands.MarcarMensajeAtendido;

public class MarcarMensajeAtendidoCommandHandler(IMensajeContactoRepository mensajeContactoRepository)
    : IRequestHandler<MarcarMensajeAtendidoCommand>
{
    public async Task Handle(MarcarMensajeAtendidoCommand request, CancellationToken cancellationToken)
    {
        await mensajeContactoRepository.MarcarAtendidoAsync(request.Id);
    }
}
