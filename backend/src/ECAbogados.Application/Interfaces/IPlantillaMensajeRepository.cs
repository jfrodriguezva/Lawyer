using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IPlantillaMensajeRepository
{
    Task<IReadOnlyList<PlantillaMensaje>> GetAllAsync();
    Task<PlantillaMensaje?> GetByIdAsync(int id);
    Task<int> CreateAsync(PlantillaMensaje plantilla);
    Task UpdateAsync(PlantillaMensaje plantilla);
    Task DeleteAsync(int id);
}
