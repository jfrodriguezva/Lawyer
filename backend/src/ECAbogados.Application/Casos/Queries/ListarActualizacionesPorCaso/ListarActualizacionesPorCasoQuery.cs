using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarActualizacionesPorCaso;

public record ListarActualizacionesPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<ActualizacionCasoDto>>;
