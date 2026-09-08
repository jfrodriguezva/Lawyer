using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auditoria.Queries.ListarAuditoriaPorCaso;

public class ListarAuditoriaPorCasoQueryHandler(IAuditoriaRepository auditoriaRepository)
    : IRequestHandler<ListarAuditoriaPorCasoQuery, IReadOnlyList<AuditoriaEntryDto>>
{
    public async Task<IReadOnlyList<AuditoriaEntryDto>> Handle(ListarAuditoriaPorCasoQuery request, CancellationToken cancellationToken)
    {
        var entradas = await auditoriaRepository.GetByCasoIdAsync(request.CasoId);

        return entradas
            .Select(e => new AuditoriaEntryDto(e.Id, e.Accion, e.Detalle, e.UsuarioNombre, e.Fecha))
            .ToList();
    }
}
