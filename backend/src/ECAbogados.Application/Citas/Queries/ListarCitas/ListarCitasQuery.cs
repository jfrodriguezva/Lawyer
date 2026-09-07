using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Queries.ListarCitas;

public record ListarCitasQuery : IRequest<IReadOnlyList<CitaDto>>;
