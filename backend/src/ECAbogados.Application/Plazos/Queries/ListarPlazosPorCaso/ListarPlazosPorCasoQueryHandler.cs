using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plazos.Queries.ListarPlazosPorCaso;

public class ListarPlazosPorCasoQueryHandler(IPlazoRepository plazoRepository)
    : IRequestHandler<ListarPlazosPorCasoQuery, IReadOnlyList<PlazoDto>>
{
    public async Task<IReadOnlyList<PlazoDto>> Handle(ListarPlazosPorCasoQuery request, CancellationToken cancellationToken)
    {
        var plazos = await plazoRepository.GetByCasoIdAsync(request.CasoId);

        return plazos
            .Select(p => new PlazoDto(p.Id, p.CasoId, p.Descripcion, p.FechaLimite, p.Cumplido))
            .ToList();
    }
}
