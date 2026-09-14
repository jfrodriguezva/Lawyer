using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Prospectos.Queries.ObtenerProspectoPorId;

public class ObtenerProspectoPorIdQueryHandler(
    IProspectoRepository prospectoRepository,
    ISolicitudCitaRepository solicitudCitaRepository)
    : IRequestHandler<ObtenerProspectoPorIdQuery, ProspectoDetalleDto?>
{
    public async Task<ProspectoDetalleDto?> Handle(ObtenerProspectoPorIdQuery request, CancellationToken cancellationToken)
    {
        var prospecto = await prospectoRepository.GetByIdAsync(request.Id);
        if (prospecto is null)
        {
            return null;
        }

        var solicitudes = await solicitudCitaRepository.GetByProspectoIdAsync(request.Id);
        var solicitudesDto = new List<SolicitudCitaDto>();
        foreach (var solicitud in solicitudes)
        {
            var historial = await solicitudCitaRepository.GetHistorialAsync(solicitud.Id);
            solicitudesDto.Add(solicitud.ToDto(historial));
        }

        return new ProspectoDetalleDto(prospecto.ToDto(), solicitudesDto);
    }
}
