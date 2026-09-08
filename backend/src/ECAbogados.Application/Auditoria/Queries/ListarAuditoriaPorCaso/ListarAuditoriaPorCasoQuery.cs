using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auditoria.Queries.ListarAuditoriaPorCaso;

public record ListarAuditoriaPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<AuditoriaEntryDto>>;
