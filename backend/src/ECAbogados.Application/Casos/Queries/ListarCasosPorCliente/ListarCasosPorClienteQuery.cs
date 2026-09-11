using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarCasosPorCliente;

public record ListarCasosPorClienteQuery(int ClienteId) : IRequest<IReadOnlyList<PortalCasoDto>>;
