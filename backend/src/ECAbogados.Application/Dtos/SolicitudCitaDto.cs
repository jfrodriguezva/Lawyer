using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record SolicitudCitaDto(
    int Id,
    int? ProspectoId,
    int? ClienteId,
    string NombreSolicitante,
    string EmailSolicitante,
    string TelefonoSolicitante,
    string? MedioContactoPreferido,
    ModuloSolicitud Modulo,
    string? ServicioInteres,
    string? Descripcion,
    DateTime FechaHoraPropuesta,
    ModalidadCita Modalidad,
    EstatusSolicitudCita Estatus,
    int? ResponsableUsuarioId,
    string? Motivo,
    int? CitaId,
    DateTime FechaCreacion,
    IReadOnlyList<HistorialCitaCambioDto> Historial);

public record HistorialCitaCambioDto(
    int Id,
    DateTime FechaHoraPropuesta,
    OrigenCambioCita PropuestoPor,
    string? Motivo,
    DateTime Fecha);

// Lo mínimo que necesita ver el solicitante en la página pública de su enlace:
// nunca se exponen ResponsableUsuarioId ni el historial completo con nombres internos.
public record SolicitudCitaPublicaDto(
    string NombreSolicitante,
    ModuloSolicitud Modulo,
    string? ServicioInteres,
    DateTime FechaHoraPropuesta,
    ModalidadCita Modalidad,
    EstatusSolicitudCita Estatus,
    string? Motivo);
