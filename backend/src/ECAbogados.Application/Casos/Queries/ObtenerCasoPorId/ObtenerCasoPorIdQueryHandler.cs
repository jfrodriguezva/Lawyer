using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using MediatR;

namespace ECAbogados.Application.Casos.Queries.ObtenerCasoPorId;

public class ObtenerCasoPorIdQueryHandler(
    ICasoRepository casoRepository,
    ICitaRepository citaRepository,
    IDocumentoRepository documentoRepository)
    : IRequestHandler<ObtenerCasoPorIdQuery, CasoDetalleDto?>
{
    public async Task<CasoDetalleDto?> Handle(ObtenerCasoPorIdQuery request, CancellationToken cancellationToken)
    {
        var caso = await casoRepository.GetByIdAsync(request.Id);
        if (caso is null)
        {
            return null;
        }

        var citas = await citaRepository.GetAllAsync();
        var documentos = await documentoRepository.GetByCasoIdAsync(request.Id);

        var citasDelCaso = citas
            .Where(c => c.CasoId == request.Id)
            .Select(c => new CitaDto(c.Id, c.CasoId, c.NombreCliente, c.Telefono, c.FechaHora, c.Estatus))
            .ToList();

        var documentosDelCaso = documentos
            .Select(d => new DocumentoDto(d.Id, d.CasoId, d.NombreArchivo, d.TipoContenido, d.TamanoBytes, d.FechaCarga, d.RutaAlmacenamiento))
            .ToList();

        return new CasoDetalleDto(
            caso.Id,
            caso.ClienteNombre,
            caso.Tipo,
            caso.Estatus,
            caso.FechaApertura,
            caso.Notas,
            citasDelCaso,
            documentosDelCaso);
    }
}
