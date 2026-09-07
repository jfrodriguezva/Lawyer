using ECAbogados.Application.Dtos;
using MediatR;

namespace ECAbogados.Application.Casos.Queries.ListarCasos;

public record ListarCasosQuery : IRequest<IReadOnlyList<CasoDto>>;
