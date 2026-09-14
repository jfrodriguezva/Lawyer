using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IActualizacionCasoRepository
{
    Task<IReadOnlyList<ActualizacionCaso>> GetByCasoIdAsync(int casoId);
    Task<int> CreateAsync(ActualizacionCaso actualizacion);
}
