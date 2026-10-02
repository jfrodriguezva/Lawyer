using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dashboard.Queries.ObtenerResumenPanel;

// Para el dashboard del panel jurídico (complementa ObtenerResumenCasosQuery):
// antes el cliente descargaba TODAS las citas, TODOS los mensajes de contacto y
// TODAS las solicitudes (con su historial) solo para mostrar 5 citas, 5
// solicitudes, un conteo y dos porcentajes. Aquí todo se calcula en SQL.
public record ResumenPanelDto(
    IReadOnlyList<CitaDto> ProximasCitas,
    int TasaConfirmacionCitas,
    int TasaAtencionMensajes,
    int SolicitudesPendientes,
    IReadOnlyList<SolicitudPendienteDto> SolicitudesPendientesRecientes);

public record SolicitudPendienteDto(
    int Id,
    string NombreSolicitante,
    DateTime FechaHoraPropuesta,
    EstatusSolicitudCita Estatus);

// Modulo: null = sin filtro (Administrador); Abogado solo ve las de su módulo,
// igual que en ListarSolicitudesCitaQuery.
public record ObtenerResumenPanelQuery(ModuloSolicitud? Modulo) : IRequest<ResumenPanelDto>;
