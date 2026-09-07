using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plazos.Queries.ListarPlazosPorCaso;

public record ListarPlazosPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<PlazoDto>>;
