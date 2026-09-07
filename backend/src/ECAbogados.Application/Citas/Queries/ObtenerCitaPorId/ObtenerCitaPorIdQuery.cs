using ECAbogados.Application.Dtos;
using MediatR;

namespace ECAbogados.Application.Citas.Queries.ObtenerCitaPorId;

public record ObtenerCitaPorIdQuery(int Id) : IRequest<CitaDto?>;
