using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.RevisarSolicitudCita;

public enum AccionRevisionSolicitud
{
    Aceptar,
    ProponerOtroHorario,
    Rechazar,
    PedirInformacion
}

public record RevisarSolicitudCitaCommand(
    int SolicitudId,
    AccionRevisionSolicitud Accion,
    DateTime? NuevaFechaHora,
    string? Motivo) : IRequest;
