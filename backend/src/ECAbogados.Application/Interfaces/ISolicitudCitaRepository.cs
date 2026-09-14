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
}
