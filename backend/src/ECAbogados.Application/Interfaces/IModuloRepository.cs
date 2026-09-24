using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IModuloRepository
{
    // Sin filtro de Activo a propósito: el Módulo en sí no tiene datos sensibles
    // y el sitio público necesita conocer también los inactivos para mostrarlos
    // como "Próximamente" (mismo criterio que Servicios/Promociones, que sí
    // ocultan su contenido cuando están inactivos).
    Task<IReadOnlyList<Modulo>> GetAllAsync();
    Task<Modulo?> GetByIdAsync(int id);
    Task<int> CreateAsync(Modulo modulo);
    Task UpdateAsync(Modulo modulo);
    Task SetActivoAsync(int id, bool activo);

    /// <summary>Elimina el Módulo junto con sus Servicios (y las referencias de esos
    /// Servicios en PromocionServicios), en una sola transacción.</summary>
    Task DeleteConServiciosAsync(int id);
}
