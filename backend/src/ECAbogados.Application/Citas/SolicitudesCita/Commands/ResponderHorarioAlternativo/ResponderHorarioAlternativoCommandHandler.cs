using ECAbogados.Application.Citas.SolicitudesCita.Shared;
using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.ResponderHorarioAlternativo;

public class ResponderHorarioAlternativoCommandHandler(
    ISolicitudCitaRepository solicitudCitaRepository,
    ICitaRepository citaRepository,
    IStaffNotifier staffNotifier) : IRequestHandler<ResponderHorarioAlternativoCommand>
{
    public async Task Handle(ResponderHorarioAlternativoCommand request, CancellationToken cancellationToken)
    {
        var solicitud = await solicitudCitaRepository.GetByTokenPublicoAsync(request.TokenPublico)
            ?? throw new KeyNotFoundException("No se encontró la solicitud.");

        if (solicitud.Estatus != EstatusSolicitudCita.HorarioAlternativoPropuesto)
        {
            throw new ConflictException("Esta solicitud ya no está esperando tu respuesta.");
        }

        if (request.Respuesta == RespuestaSolicitante.AceptarHorario)
        {
            await ConfirmacionCitaService.ConfirmarAsync(citaRepository, solicitud);
        }
        else
        {
            await solicitudCitaRepository.AgregarHistorialAsync(new HistorialCitaCambio
            {
                SolicitudCitaId = solicitud.Id,
                FechaHoraPropuesta = request.NuevaFechaHoraPropuesta!.Value,
                PropuestoPor = OrigenCambioCita.Solicitante,
                Fecha = DateTime.UtcNow
            });

            solicitud.FechaHoraPropuesta = request.NuevaFechaHoraPropuesta.Value;
            solicitud.Estatus = EstatusSolicitudCita.EnRevision;

            await staffNotifier.NotifyAsync(
                "Solicitante propuso otro horario",
                $"{solicitud.NombreSolicitante} propuso el {request.NuevaFechaHoraPropuesta:dd/MM/yyyy HH:mm} para su cita.",
                cancellationToken);
        }

        await solicitudCitaRepository.UpdateAsync(solicitud);
    }
}
