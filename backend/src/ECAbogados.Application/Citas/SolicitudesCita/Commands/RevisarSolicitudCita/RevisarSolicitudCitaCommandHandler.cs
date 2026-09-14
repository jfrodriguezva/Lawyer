using ECAbogados.Application.Citas.SolicitudesCita.Shared;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.RevisarSolicitudCita;

public class RevisarSolicitudCitaCommandHandler(
    ISolicitudCitaRepository solicitudCitaRepository,
    ICitaRepository citaRepository,
    ISolicitudCitaNotifier notifier,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<RevisarSolicitudCitaCommand>
{
    public async Task Handle(RevisarSolicitudCitaCommand request, CancellationToken cancellationToken)
    {
        var solicitud = await solicitudCitaRepository.GetByIdAsync(request.SolicitudId)
            ?? throw new KeyNotFoundException($"No se encontró la solicitud con Id {request.SolicitudId}");

        solicitud.ResponsableUsuarioId = currentUser.UsuarioId;
        string accionDescripcion;

        switch (request.Accion)
        {
            case AccionRevisionSolicitud.Aceptar:
                await ConfirmacionCitaService.ConfirmarAsync(citaRepository, solicitud);
                accionDescripcion = "Aceptó la solicitud de cita";

                await notifier.NotificarConfirmadaAsync(solicitud.EmailSolicitante, solicitud.NombreSolicitante, solicitud.FechaHoraPropuesta, cancellationToken);
                break;

            case AccionRevisionSolicitud.ProponerOtroHorario:
                await solicitudCitaRepository.AgregarHistorialAsync(new HistorialCitaCambio
                {
                    SolicitudCitaId = solicitud.Id,
                    FechaHoraPropuesta = request.NuevaFechaHora!.Value,
                    PropuestoPor = OrigenCambioCita.Staff,
                    Motivo = request.Motivo,
                    Fecha = DateTime.UtcNow
                });
                solicitud.FechaHoraPropuesta = request.NuevaFechaHora.Value;
                solicitud.Estatus = EstatusSolicitudCita.HorarioAlternativoPropuesto;
                accionDescripcion = $"Propuso un nuevo horario: {request.NuevaFechaHora:dd/MM/yyyy HH:mm}";

                await notifier.NotificarHorarioAlternativoAsync(
                    solicitud.EmailSolicitante, solicitud.NombreSolicitante, solicitud.TokenPublico, request.NuevaFechaHora.Value, cancellationToken);
                break;

            case AccionRevisionSolicitud.Rechazar:
                solicitud.Estatus = EstatusSolicitudCita.Rechazada;
                solicitud.Motivo = request.Motivo;
                accionDescripcion = $"Rechazó la solicitud: {request.Motivo}";

                await notifier.NotificarRechazadaAsync(solicitud.EmailSolicitante, solicitud.NombreSolicitante, request.Motivo!, cancellationToken);
                break;

            case AccionRevisionSolicitud.PedirInformacion:
                solicitud.Estatus = EstatusSolicitudCita.InformacionRequerida;
                solicitud.Motivo = request.Motivo;
                accionDescripcion = $"Pidió información adicional: {request.Motivo}";

                await notifier.NotificarInformacionRequeridaAsync(
                    solicitud.EmailSolicitante, solicitud.NombreSolicitante, request.Motivo!, solicitud.TokenPublico, cancellationToken);
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(request), "Acción de revisión no reconocida.");
        }

        await solicitudCitaRepository.UpdateAsync(solicitud);
        await auditoriaRepository.RegistrarAsync(currentUser, "SolicitudCita", solicitud.Id, accionDescripcion);
    }
}
