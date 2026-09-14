using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Prospectos.Queries.ListarProspectos;

public record ListarProspectosQuery : IRequest<IReadOnlyList<ProspectoDto>>;
