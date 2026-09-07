using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ObtenerCasoPorId;

public record ObtenerCasoPorIdQuery(int Id) : IRequest<CasoDetalleDto?>;
