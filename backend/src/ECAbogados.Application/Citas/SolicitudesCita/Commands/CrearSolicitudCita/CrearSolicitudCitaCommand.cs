using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.CrearSolicitudCita;

public record CrearSolicitudCitaCommand(
    string NombreSolicitante,
    string EmailSolicitante,
    string TelefonoSolicitante,
    string? MedioContactoPreferido,
    ModuloSolicitud Modulo,
    string? ServicioInteres,
    string? Descripcion,
    DateTime FechaHoraPropuesta,
    ModalidadCita Modalidad,
    bool AceptoAvisoPrivacidad) : IRequest<CrearSolicitudCitaResult>;

public record CrearSolicitudCitaResult(int Id, string TokenPublico);
