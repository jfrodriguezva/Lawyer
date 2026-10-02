using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dashboard.Queries.ObtenerResumenPanel;

public class ObtenerResumenPanelQueryHandler(
    ICitaRepository citaRepository,
    IMensajeContactoRepository mensajeContactoRepository,
    ISolicitudCitaRepository solicitudCitaRepository) : IRequestHandler<ObtenerResumenPanelQuery, ResumenPanelDto>
{
    private const int Top = 5;

    // Solicitudes que todavía esperan una acción (del despacho o del solicitante).
    public static readonly IReadOnlyList<EstatusSolicitudCita> EstatusPendientes =
    [
        EstatusSolicitudCita.SolicitudRecibida,
        EstatusSolicitudCita.EnRevision,
        EstatusSolicitudCita.InformacionRequerida,
        EstatusSolicitudCita.HorarioAlternativoPropuesto,
        EstatusSolicitudCita.PendienteConfirmacionSolicitante,
    ];

    public async Task<ResumenPanelDto> Handle(ObtenerResumenPanelQuery request, CancellationToken cancellationToken)
    {
        // Las fechas de las citas se guardan en UTC (el panel las manda con
        // toISOString y RecordatorioBackgroundService también compara en UTC).
        var proximasTask = citaRepository.GetProximasAsync(DateTime.UtcNow, Top);
        var conteoCitasTask = citaRepository.GetConteoConfirmadasAsync();
        var conteoMensajesTask = mensajeContactoRepository.GetConteoAtendidosAsync();
        var pendientesTask = solicitudCitaRepository.GetPendientesAsync(EstatusPendientes, request.Modulo, Top);
        await Task.WhenAll(proximasTask, conteoCitasTask, conteoMensajesTask, pendientesTask);

        var (totalCitas, confirmadas) = conteoCitasTask.Result;
        var (totalMensajes, atendidos) = conteoMensajesTask.Result;
        var (totalPendientes, pendientesRecientes) = pendientesTask.Result;

        return new ResumenPanelDto(
            proximasTask.Result.Select(c => c.ToDto()).ToList(),
            Porcentaje(confirmadas, totalCitas),
            Porcentaje(atendidos, totalMensajes),
            totalPendientes,
            pendientesRecientes
                .Select(s => new SolicitudPendienteDto(s.Id, s.NombreSolicitante, s.FechaHoraPropuesta, s.Estatus))
                .ToList());
    }

    // Mismo redondeo que hacía el dashboard en el cliente (Math.round).
    private static int Porcentaje(int parte, int total) =>
        total == 0 ? 0 : (int)Math.Round(parte * 100.0 / total, MidpointRounding.AwayFromZero);
}
