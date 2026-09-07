using ECAbogados.Application.Dtos;
using MediatR;

namespace ECAbogados.Application.Citas.Queries.ListarCitas;

public record ListarCitasQuery : IRequest<IReadOnlyList<CitaDto>>;
