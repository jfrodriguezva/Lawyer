using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarCasosPorCliente;

public class ListarCasosPorClienteQueryHandler(
    ICasoRepository casoRepository,
    IDocumentoRepository documentoRepository,
    IChecklistItemRepository checklistItemRepository)
    : IRequestHandler<ListarCasosPorClienteQuery, IReadOnlyList<PortalCasoDto>>
{
    public async Task<IReadOnlyList<PortalCasoDto>> Handle(ListarCasosPorClienteQuery request, CancellationToken cancellationToken)
    {
        var casos = await casoRepository.GetByClienteIdAsync(request.ClienteId);

        var resultado = new List<PortalCasoDto>();
        foreach (var caso in casos)
        {
            var documentos = await documentoRepository.GetByCasoIdAsync(caso.Id);
            var checklist = await checklistItemRepository.GetByCasoIdAsync(caso.Id);

            resultado.Add(new PortalCasoDto(
                caso.Id,
                caso.ClienteNombre,
                caso.Tipo,
                caso.Estatus,
                caso.FechaApertura,
                checklist.Select(c => new ChecklistItemDto(c.Id, c.CasoId, c.Descripcion, c.Completado)).ToList(),
                documentos.Select(d => new DocumentoDto(d.Id, d.CasoId, d.NombreArchivo, d.TipoContenido, d.TamanoBytes, d.FechaCarga, d.RutaAlmacenamiento)).ToList()));
        }

        return resultado;
    }
}
