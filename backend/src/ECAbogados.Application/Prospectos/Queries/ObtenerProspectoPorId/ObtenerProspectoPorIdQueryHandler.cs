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
        var historialPorSolicitud = await solicitudCitaRepository.GetHistorialPorSolicitudesAsync(
            solicitudes.Select(s => s.Id).ToList());
        var solicitudesDto = solicitudes
            .Select(s => s.ToDto(historialPorSolicitud.GetValueOrDefault(s.Id) ?? []))
            .ToList();

        return new ProspectoDetalleDto(prospecto.ToDto(), solicitudesDto);
    }
}
