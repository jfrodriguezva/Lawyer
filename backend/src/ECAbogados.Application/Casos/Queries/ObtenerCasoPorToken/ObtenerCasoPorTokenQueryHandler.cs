using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ObtenerCasoPorToken;

public class ObtenerCasoPorTokenQueryHandler(
    ICasoRepository casoRepository,
    IDocumentoRepository documentoRepository,
    IChecklistItemRepository checklistItemRepository)
    : IRequestHandler<ObtenerCasoPorTokenQuery, PortalCasoDto?>
{
    // Vigencia del enlace mágico del portal: pasado este tiempo, el staff debe
    // regenerarlo desde el panel (evita un link eternamente válido).
    private static readonly TimeSpan VigenciaToken = TimeSpan.FromDays(180);

    public async Task<PortalCasoDto?> Handle(ObtenerCasoPorTokenQuery request, CancellationToken cancellationToken)
    {
        var caso = await casoRepository.GetByTokenAsync(request.Token);
        if (caso is null)
        {
            return null;
        }

        if (caso.TokenGeneradoEn is null || DateTime.UtcNow - caso.TokenGeneradoEn > VigenciaToken)
        {
            return null;
        }

        var documentos = await documentoRepository.GetByCasoIdAsync(caso.Id);
        var checklist = await checklistItemRepository.GetByCasoIdAsync(caso.Id);

        return new PortalCasoDto(
            caso.Id,
            caso.ClienteNombre,
            caso.Tipo,
            caso.Estatus,
            caso.FechaApertura,
            checklist.Select(c => new ChecklistItemDto(c.Id, c.CasoId, c.Descripcion, c.Completado)).ToList(),
            documentos.Select(d => new DocumentoDto(d.Id, d.CasoId, d.NombreArchivo, d.TipoContenido, d.TamanoBytes, d.FechaCarga, d.RutaAlmacenamiento)).ToList());
    }
}
