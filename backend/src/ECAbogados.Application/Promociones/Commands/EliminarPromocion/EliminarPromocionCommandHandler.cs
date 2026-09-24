using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Commands.EliminarPromocion;

public class EliminarPromocionCommandHandler(IPromocionRepository promocionRepository) : IRequestHandler<EliminarPromocionCommand>
{
    public Task Handle(EliminarPromocionCommand request, CancellationToken cancellationToken) =>
        promocionRepository.DeleteAsync(request.Id);
}
