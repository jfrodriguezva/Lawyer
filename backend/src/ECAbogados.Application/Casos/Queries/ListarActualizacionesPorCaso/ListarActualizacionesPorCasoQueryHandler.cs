using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarActualizacionesPorCaso;

// Uso exclusivo del panel del Abogado/Administrador: incluye Internas y
// Compartidas. El portal del Cliente NUNCA usa este query (ver PortalCasoMapper).
public class ListarActualizacionesPorCasoQueryHandler(IActualizacionCasoRepository actualizacionCasoRepository)
    : IRequestHandler<ListarActualizacionesPorCasoQuery, IReadOnlyList<ActualizacionCasoDto>>
{
    public async Task<IReadOnlyList<ActualizacionCasoDto>> Handle(ListarActualizacionesPorCasoQuery request, CancellationToken cancellationToken)
    {
        var actualizaciones = await actualizacionCasoRepository.GetByCasoIdAsync(request.CasoId);
        return actualizaciones.Select(a => a.ToDto()).ToList();
    }
}
