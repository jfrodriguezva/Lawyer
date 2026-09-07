using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;

public class CambiarEstatusCasoCommandHandler(ICasoRepository casoRepository) : IRequestHandler<CambiarEstatusCasoCommand>
{
    public async Task Handle(CambiarEstatusCasoCommand request, CancellationToken cancellationToken)
    {
        var caso = await casoRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el caso con Id {request.Id}");

        caso.Estatus = request.Estatus;

        await casoRepository.UpdateAsync(caso);
    }
}
