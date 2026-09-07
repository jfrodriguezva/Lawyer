using ECAbogados.Application.Dtos;
using MediatR;

namespace ECAbogados.Application.Casos.Queries.ObtenerCasoPorId;

public record ObtenerCasoPorIdQuery(int Id) : IRequest<CasoDetalleDto?>;
