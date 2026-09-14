using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Plantillas.Queries.ListarPlantillas;

public class ListarPlantillasQueryHandler(IPlantillaMensajeRepository plantillaRepository) : IRequestHandler<ListarPlantillasQuery, IReadOnlyList<PlantillaMensaje>>
{
    public Task<IReadOnlyList<PlantillaMensaje>> Handle(ListarPlantillasQuery request, CancellationToken cancellationToken) =>
        plantillaRepository.GetAllAsync();
}
