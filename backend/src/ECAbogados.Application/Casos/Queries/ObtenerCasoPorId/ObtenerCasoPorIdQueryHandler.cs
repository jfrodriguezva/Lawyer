using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ObtenerCasoPorId;

public class ObtenerCasoPorIdQueryHandler(
    ICasoRepository casoRepository,
    ICitaRepository citaRepository,
    IDocumentoRepository documentoRepository,
    IChecklistItemRepository checklistItemRepository,
    IClienteRepository clienteRepository,
    IUsuarioRepository usuarioRepository,
    IActualizacionCasoRepository actualizacionCasoRepository,
    ITareaCasoRepository tareaCasoRepository)
    : IRequestHandler<ObtenerCasoPorIdQuery, CasoDetalleDto?>
{
    public async Task<CasoDetalleDto?> Handle(ObtenerCasoPorIdQuery request, CancellationToken cancellationToken)
    {
        var caso = await casoRepository.GetByIdAsync(request.Id);
        if (caso is null)
        {
            return null;
        }

        var clienteVinculado = caso.ClienteId is int clienteId
            ? await clienteRepository.GetByIdAsync(clienteId)
            : null;

        var usuarios = await usuarioRepository.GetAllAsync();
        var nombresPorId = usuarios.ToDictionary(u => u.Id, u => u.Nombre);
        var abogadoResponsableNombre = caso.AbogadoResponsableId is int abogadoId && nombresPorId.TryGetValue(abogadoId, out var nombreAbogado)
            ? nombreAbogado
            : null;

        var citas = await citaRepository.GetAllAsync();
        var documentos = await documentoRepository.GetByCasoIdAsync(request.Id);
        var checklist = await checklistItemRepository.GetByCasoIdAsync(request.Id);
        var actualizaciones = await actualizacionCasoRepository.GetByCasoIdAsync(request.Id);
        var tareas = await tareaCasoRepository.GetByCasoIdAsync(request.Id);

        var citasDelCaso = citas.Where(c => c.CasoId == request.Id).Select(c => c.ToDto()).ToList();
        var documentosDelCaso = documentos.Select(d => d.ToDto()).ToList();
        var checklistDelCaso = checklist.Select(c => c.ToDto()).ToList();
        var actualizacionesDelCaso = actualizaciones.Select(a => a.ToDto()).ToList();
        var tareasDelCaso = tareas
            .Select(t => new TareaCasoDto(
                t.Id, t.CasoId, t.Descripcion, t.ResponsableUsuarioId,
                t.ResponsableUsuarioId is int rid && nombresPorId.TryGetValue(rid, out var nombreResp) ? nombreResp : null,
                t.FechaVencimiento, t.Completada, t.FechaCreacion))
            .ToList();

        return new CasoDetalleDto(
            caso.Id,
            caso.ClienteNombre,
            caso.Tipo,
            caso.Estatus,
            caso.FechaApertura,
            caso.Notas,
            caso.TokenAcceso,
            caso.TokenGeneradoEn,
            citasDelCaso,
            documentosDelCaso,
            checklistDelCaso,
            clienteVinculado?.Id,
            clienteVinculado?.Nombre,
            clienteVinculado?.Email,
            caso.AbogadoResponsableId,
            abogadoResponsableNombre,
            caso.Prioridad,
            caso.FolioInterno,
            caso.ContraparteNombre,
            caso.AutoridadOrganismo,
            caso.NumeroExpedienteExterno,
            caso.FechaCierre,
            caso.MotivoCierre,
            caso.Archivado,
            caso.MontoAcordado,
            actualizacionesDelCaso,
            tareasDelCaso);
    }
}
