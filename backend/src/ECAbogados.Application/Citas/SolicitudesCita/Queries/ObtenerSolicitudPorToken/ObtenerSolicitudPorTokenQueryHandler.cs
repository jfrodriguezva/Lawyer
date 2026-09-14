using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Queries.ObtenerSolicitudPorToken;

public class ObtenerSolicitudPorTokenQueryHandler(ISolicitudCitaRepository solicitudCitaRepository)
    : IRequestHandler<ObtenerSolicitudPorTokenQuery, SolicitudCitaPublicaDto?>
{
    public async Task<SolicitudCitaPublicaDto?> Handle(ObtenerSolicitudPorTokenQuery request, CancellationToken cancellationToken)
    {
        var solicitud = await solicitudCitaRepository.GetByTokenPublicoAsync(request.Token);
        return solicitud?.ToPublicaDto();
    }
}
