using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Queries.ListarPromocionesActivas;

public class ListarPromocionesActivasQueryHandler(IPromocionRepository promocionRepository) : IRequestHandler<ListarPromocionesActivasQuery, IReadOnlyList<PromocionPublicaDto>>
{
    public async Task<IReadOnlyList<PromocionPublicaDto>> Handle(ListarPromocionesActivasQuery request, CancellationToken cancellationToken)
    {
        var promociones = await promocionRepository.GetActivasAsync();
        return promociones.Select(p => new PromocionPublicaDto(p.Id, p.Texto, p.ServicioIds)).ToList();
    }
}
