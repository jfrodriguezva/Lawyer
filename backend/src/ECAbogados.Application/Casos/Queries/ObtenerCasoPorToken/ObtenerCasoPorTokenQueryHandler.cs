using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Casos.Queries.ObtenerCasoPorToken;

public class ObtenerCasoPorTokenQueryHandler(
    ICasoRepository casoRepository,
    IDocumentoRepository documentoRepository,
    IChecklistItemRepository checklistItemRepository,
    IActualizacionCasoRepository actualizacionCasoRepository,
    ICitaRepository citaRepository)
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

        return await PortalCasoMapper.BuildAsync(
            caso, documentoRepository, checklistItemRepository, actualizacionCasoRepository, citaRepository);
    }
}

/// <summary>
/// Construye el DTO que ve el Cliente (portal autenticado o enlace mágico):
/// única implementación para no repetirla entre los dos flujos.
/// </summary>
internal static class PortalCasoMapper
{
    public static async Task<PortalCasoDto> BuildAsync(
        Caso caso,
        IDocumentoRepository documentoRepository,
        IChecklistItemRepository checklistItemRepository,
        IActualizacionCasoRepository actualizacionCasoRepository,
        ICitaRepository citaRepository)
    {
        var documentos = await documentoRepository.GetByCasoIdAsync(caso.Id);
        var checklist = await checklistItemRepository.GetByCasoIdAsync(caso.Id);
        var actualizaciones = await actualizacionCasoRepository.GetByCasoIdAsync(caso.Id);
        var citas = await citaRepository.GetAllAsync();

        var documentosVisibles = documentos
            .Where(d => d.Visibilidad != VisibilidadDocumento.Interno)
            .Select(d => d.ToDto())
            .ToList();

        var actualizacionesCompartidas = actualizaciones
            .Where(a => a.Visibilidad == VisibilidadActualizacion.Compartida)
            .Select(a => a.ToDto())
            .ToList();

        var proximasCitas = citas
            .Where(c => c.CasoId == caso.Id && c.FechaHora >= DateTime.UtcNow && c.Estatus == EstatusCita.Confirmada)
            .Select(c => c.ToDto())
            .ToList();

        return new PortalCasoDto(
            caso.Id,
            caso.ClienteNombre,
            caso.Tipo,
            caso.Estatus,
            caso.FechaApertura,
            checklist.Select(c => c.ToDto()).ToList(),
            documentosVisibles,
            actualizacionesCompartidas,
            proximasCitas);
    }
}
