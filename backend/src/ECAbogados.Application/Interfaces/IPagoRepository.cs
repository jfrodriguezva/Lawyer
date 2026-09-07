using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IPagoRepository
{
    Task<IReadOnlyList<Pago>> GetByCasoIdAsync(int casoId);
    Task<int> CreateAsync(Pago pago);
}
