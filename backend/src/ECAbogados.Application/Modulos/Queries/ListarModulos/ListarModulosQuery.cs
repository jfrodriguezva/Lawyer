using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Modulos.Queries.ListarModulos;

public record ListarModulosQuery : IRequest<IReadOnlyList<Modulo>>;
