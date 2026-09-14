using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.CatalogoSAT.Commands.ActualizarTramiteCatalogo;

public class ActualizarTramiteCatalogoCommandHandler(ICatalogoTramiteSATRepository catalogoRepository) : IRequestHandler<ActualizarTramiteCatalogoCommand>
{
    public async Task Handle(ActualizarTramiteCatalogoCommand request, CancellationToken cancellationToken)
    {
        var tramite = await catalogoRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el trámite de catálogo con Id {request.Id}");

        tramite.Nombre = request.Nombre;
        tramite.Requisitos = request.Requisitos;
        tramite.Etapas = request.Etapas;
        tramite.Observaciones = request.Observaciones;

        await catalogoRepository.UpdateAsync(tramite);
    }
}
