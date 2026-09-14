using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auditoria.Queries.ListarAuditoriaGlobal;

public record ListarAuditoriaGlobalQuery(int Page, int PageSize, string? Entidad) : IRequest<PagedResultDto<AuditoriaGlobalEntryDto>>;
