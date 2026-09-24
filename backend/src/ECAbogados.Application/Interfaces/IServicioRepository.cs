using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IServicioRepository
{
    Task<IReadOnlyList<Servicio>> GetAllAsync(int? moduloId);

    /// <summary>Solo servicios activos de módulos activos, para el sitio público.</summary>
    Task<IReadOnlyList<Servicio>> GetActivosAsync();

    Task<Servicio?> GetByIdAsync(int id);
    Task<int> CreateAsync(Servicio servicio);
    Task UpdateAsync(Servicio servicio);
    Task SetActivoAsync(int id, bool activo);
    Task DeleteAsync(int id);
}
