using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IRegistroTiempoRepository
{
    Task<IReadOnlyList<RegistroTiempo>> GetByCasoIdAsync(int casoId);
    Task<IReadOnlyList<RegistroTiempo>> GetAllAsync(DateTime? desde, DateTime? hasta);
    Task<int> CreateAsync(RegistroTiempo registro);
}
