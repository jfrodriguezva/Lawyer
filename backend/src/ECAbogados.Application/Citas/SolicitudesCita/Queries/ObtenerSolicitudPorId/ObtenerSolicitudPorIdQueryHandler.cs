using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Queries.ObtenerSolicitudPorId;

public class ObtenerSolicitudPorIdQueryHandler(ISolicitudCitaRepository solicitudCitaRepository)
    : IRequestHandler<ObtenerSolicitudPorIdQuery, SolicitudCitaDto?>
{
    public async Task<SolicitudCitaDto?> Handle(ObtenerSolicitudPorIdQuery request, CancellationToken cancellationToken)
    {
        var solicitud = await solicitudCitaRepository.GetByIdAsync(request.Id);
        if (solicitud is null) return null;

        var historial = await solicitudCitaRepository.GetHistorialAsync(solicitud.Id);
        return solicitud.ToDto(historial);
    }
}
