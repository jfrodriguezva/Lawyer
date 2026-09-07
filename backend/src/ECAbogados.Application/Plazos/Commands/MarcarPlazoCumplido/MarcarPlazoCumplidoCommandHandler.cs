using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plazos.Commands.MarcarPlazoCumplido;

public class MarcarPlazoCumplidoCommandHandler(IPlazoRepository plazoRepository)
    : IRequestHandler<MarcarPlazoCumplidoCommand>
{
    public async Task Handle(MarcarPlazoCumplidoCommand request, CancellationToken cancellationToken)
    {
        await plazoRepository.SetCumplidoAsync(request.Id, request.Cumplido);
    }
}
