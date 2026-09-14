using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auditoria.Queries.ListarAuditoriaGlobal;

public class ListarAuditoriaGlobalQueryHandler(IAuditoriaRepository auditoriaRepository)
    : IRequestHandler<ListarAuditoriaGlobalQuery, PagedResultDto<AuditoriaGlobalEntryDto>>
{
    public async Task<PagedResultDto<AuditoriaGlobalEntryDto>> Handle(ListarAuditoriaGlobalQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await auditoriaRepository.GetPagedAsync(request.Page, request.PageSize, request.Entidad);

        var dtos = items
            .Select(e => new AuditoriaGlobalEntryDto(e.Id, e.Entidad, e.EntidadId, e.Accion, e.Detalle, e.UsuarioNombre, e.Fecha, e.Ip))
            .ToList();

        return new PagedResultDto<AuditoriaGlobalEntryDto>(dtos, total, request.Page, request.PageSize);
    }
}
