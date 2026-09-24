using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IPromocionRepository
{
    Task<IReadOnlyList<Promocion>> GetAllAsync();
    Task<IReadOnlyList<Promocion>> GetActivasAsync();
    Task<Promocion?> GetByIdAsync(int id);

    /// <summary>Inserta la Promoción y sus vínculos en PromocionServicios en una transacción.</summary>
    Task<int> CreateAsync(Promocion promocion);

    /// <summary>Actualiza la Promoción y reemplaza sus vínculos en PromocionServicios (borra e inserta) en una transacción.</summary>
    Task UpdateAsync(Promocion promocion);

    Task SetActivoAsync(int id, bool activo);
    Task DeleteAsync(int id);
}
