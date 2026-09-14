using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.TramitesSAT.Queries.ListarTramitesSAT;

public record ListarTramitesSATQuery : IRequest<IReadOnlyList<TramiteSATDto>>;
