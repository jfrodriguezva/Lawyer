using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Configuracion.Commands.ActualizarFlag;

public class ActualizarFlagCommandHandler(IConfiguracionRepository configuracionRepository) : IRequestHandler<ActualizarFlagCommand>
{
    public Task Handle(ActualizarFlagCommand request, CancellationToken cancellationToken) =>
        configuracionRepository.SetValorAsync(request.Clave, request.Valor ? "true" : "false");
}
