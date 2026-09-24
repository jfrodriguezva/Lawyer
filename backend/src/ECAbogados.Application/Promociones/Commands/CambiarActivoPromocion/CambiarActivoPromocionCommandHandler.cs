using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Commands.CambiarActivoPromocion;

public class CambiarActivoPromocionCommandHandler(IPromocionRepository promocionRepository) : IRequestHandler<CambiarActivoPromocionCommand>
{
    public Task Handle(CambiarActivoPromocionCommand request, CancellationToken cancellationToken) =>
        promocionRepository.SetActivoAsync(request.Id, request.Activo);
}
