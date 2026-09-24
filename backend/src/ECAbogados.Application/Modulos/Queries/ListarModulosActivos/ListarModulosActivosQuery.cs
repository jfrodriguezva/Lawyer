using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Modulos.Queries.ListarModulosActivos;

public record ListarModulosActivosQuery : IRequest<IReadOnlyList<Modulo>>;
