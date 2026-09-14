using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeSolicitudCitaRepository : ISolicitudCitaRepository
{
    private readonly List<SolicitudCita> _solicitudes = [];
    private readonly List<HistorialCitaCambio> _historial = [];
    private int _nextId = 1;
    private int _nextHistorialId = 1;

    public Task<SolicitudCita?> GetByIdAsync(int id) =>
        Task.FromResult(_solicitudes.FirstOrDefault(s => s.Id == id));

    public Task<SolicitudCita?> GetByTokenPublicoAsync(string token) =>
        Task.FromResult(_solicitudes.FirstOrDefault(s => s.TokenPublico == token));

    public Task<IReadOnlyList<SolicitudCita>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<SolicitudCita>>(_solicitudes.ToList());

    public Task<IReadOnlyList<SolicitudCita>> GetByProspectoIdAsync(int prospectoId) =>
        Task.FromResult<IReadOnlyList<SolicitudCita>>(_solicitudes.Where(s => s.ProspectoId == prospectoId).ToList());

    public Task<int> CreateAsync(SolicitudCita solicitud)
    {
        solicitud.Id = _nextId++;
        _solicitudes.Add(solicitud);
        return Task.FromResult(solicitud.Id);
    }

    public Task UpdateAsync(SolicitudCita solicitud)
    {
        var existente = _solicitudes.First(s => s.Id == solicitud.Id);
        existente.FechaHoraPropuesta = solicitud.FechaHoraPropuesta;
        existente.Estatus = solicitud.Estatus;
        existente.ResponsableUsuarioId = solicitud.ResponsableUsuarioId;
        existente.Motivo = solicitud.Motivo;
        existente.CitaId = solicitud.CitaId;
        return Task.CompletedTask;
    }

    public Task AgregarHistorialAsync(HistorialCitaCambio historial)
    {
        historial.Id = _nextHistorialId++;
        _historial.Add(historial);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<HistorialCitaCambio>> GetHistorialAsync(int solicitudCitaId) =>
        Task.FromResult<IReadOnlyList<HistorialCitaCambio>>(_historial.Where(h => h.SolicitudCitaId == solicitudCitaId).ToList());
}
