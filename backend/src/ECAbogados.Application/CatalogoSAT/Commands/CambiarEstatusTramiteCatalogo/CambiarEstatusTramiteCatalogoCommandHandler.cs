using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.CatalogoSAT.Commands.CambiarEstatusTramiteCatalogo;

public class CambiarEstatusTramiteCatalogoCommandHandler(ICatalogoTramiteSATRepository catalogoRepository) : IRequestHandler<CambiarEstatusTramiteCatalogoCommand>
{
    public Task Handle(CambiarEstatusTramiteCatalogoCommand request, CancellationToken cancellationToken) =>
        catalogoRepository.SetActivoAsync(request.Id, request.Activo);
}
