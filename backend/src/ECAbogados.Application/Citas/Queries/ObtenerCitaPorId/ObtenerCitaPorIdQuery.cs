using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Queries.ObtenerCitaPorId;

public record ObtenerCitaPorIdQuery(int Id) : IRequest<CitaDto?>;
