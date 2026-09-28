using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ISolicitudCitaRepository
{
    Task<SolicitudCita?> GetByIdAsync(int id);
    Task<SolicitudCita?> GetByTokenPublicoAsync(string token);
    Task<IReadOnlyList<SolicitudCita>> GetAllAsync();
    Task<IReadOnlyList<SolicitudCita>> GetByProspectoIdAsync(int prospectoId);
    Task<int> CreateAsync(SolicitudCita solicitud);
    Task UpdateAsync(SolicitudCita solicitud);
    Task AgregarHistorialAsync(HistorialCitaCambio historial);
    Task<IReadOnlyList<HistorialCitaCambio>> GetHistorialAsync(int solicitudCitaId);

    // Historial de varias solicitudes en una sola consulta (evita N+1 al listar).
    // Las solicitudes sin historial no aparecen en el diccionario.
    Task<IReadOnlyDictionary<int, IReadOnlyList<HistorialCitaCambio>>> GetHistorialPorSolicitudesAsync(IReadOnlyCollection<int> solicitudCitaIds);

    // Para el dashboard: total de solicitudes en los estatus indicados (opcionalmente
    // de un solo módulo) + las `top` más recientes, sin traer la tabla completa.
    Task<(int Total, IReadOnlyList<SolicitudCita> MasRecientes)> GetPendientesAsync(
        IReadOnlyCollection<EstatusSolicitudCita> estatusPendientes, ModuloSolicitud? modulo, int top);
}
