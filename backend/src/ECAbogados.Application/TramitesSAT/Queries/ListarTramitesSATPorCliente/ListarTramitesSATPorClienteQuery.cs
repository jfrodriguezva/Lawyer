using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.TramitesSAT.Queries.ListarTramitesSATPorCliente;

public record ListarTramitesSATPorClienteQuery(int ClienteId) : IRequest<IReadOnlyList<TramiteSATDto>>;
