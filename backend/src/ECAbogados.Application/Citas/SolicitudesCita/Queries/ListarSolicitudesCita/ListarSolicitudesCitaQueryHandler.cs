using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Queries.ListarSolicitudesCita;

public class ListarSolicitudesCitaQueryHandler(ISolicitudCitaRepository solicitudCitaRepository)
    : IRequestHandler<ListarSolicitudesCitaQuery, IReadOnlyList<SolicitudCitaDto>>
{
    public async Task<IReadOnlyList<SolicitudCitaDto>> Handle(ListarSolicitudesCitaQuery request, CancellationToken cancellationToken)
    {
        var solicitudes = (await solicitudCitaRepository.GetAllAsync())
            .Where(s => request.Modulo is null || s.Modulo == request.Modulo)
            .ToList();

        // Antes: una consulta de historial por cada solicitud (N+1). Ahora una sola
        // consulta para todas.
        var historialPorSolicitud = await solicitudCitaRepository.GetHistorialPorSolicitudesAsync(
            solicitudes.Select(s => s.Id).ToList());

        return solicitudes
            .Select(s => s.ToDto(historialPorSolicitud.GetValueOrDefault(s.Id) ?? []))
            .ToList();
    }
}
