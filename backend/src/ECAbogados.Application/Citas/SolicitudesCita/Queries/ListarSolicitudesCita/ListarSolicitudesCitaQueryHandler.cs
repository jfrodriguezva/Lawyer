using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Queries.ListarSolicitudesCita;

public class ListarSolicitudesCitaQueryHandler(ISolicitudCitaRepository solicitudCitaRepository)
    : IRequestHandler<ListarSolicitudesCitaQuery, IReadOnlyList<SolicitudCitaDto>>
{
    public async Task<IReadOnlyList<SolicitudCitaDto>> Handle(ListarSolicitudesCitaQuery request, CancellationToken cancellationToken)
    {
        var solicitudes = await solicitudCitaRepository.GetAllAsync();

        var resultado = new List<SolicitudCitaDto>();
        foreach (var solicitud in solicitudes)
        {
            if (request.Modulo is not null && solicitud.Modulo != request.Modulo)
            {
                continue;
            }

            var historial = await solicitudCitaRepository.GetHistorialAsync(solicitud.Id);
            resultado.Add(solicitud.ToDto(historial));
        }

        return resultado;
    }
}
