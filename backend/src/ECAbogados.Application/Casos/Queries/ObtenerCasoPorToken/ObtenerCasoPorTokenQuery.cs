using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ObtenerCasoPorToken;

public record ObtenerCasoPorTokenQuery(string Token) : IRequest<PortalCasoDto?>;
