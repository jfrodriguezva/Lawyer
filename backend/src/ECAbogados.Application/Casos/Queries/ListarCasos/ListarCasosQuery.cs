using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarCasos;

public record ListarCasosQuery : IRequest<IReadOnlyList<CasoDto>>;
