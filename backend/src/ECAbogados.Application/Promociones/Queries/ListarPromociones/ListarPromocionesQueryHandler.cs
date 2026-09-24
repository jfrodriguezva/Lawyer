using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Promociones.Queries.ListarPromociones;

public class ListarPromocionesQueryHandler(IPromocionRepository promocionRepository) : IRequestHandler<ListarPromocionesQuery, IReadOnlyList<Promocion>>
{
    public Task<IReadOnlyList<Promocion>> Handle(ListarPromocionesQuery request, CancellationToken cancellationToken) =>
        promocionRepository.GetAllAsync();
}
