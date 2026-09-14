using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Plantillas.Commands.CrearPlantilla;

public class CrearPlantillaCommandHandler(IPlantillaMensajeRepository plantillaRepository) : IRequestHandler<CrearPlantillaCommand, int>
{
    public Task<int> Handle(CrearPlantillaCommand request, CancellationToken cancellationToken) =>
        plantillaRepository.CreateAsync(new PlantillaMensaje { Nombre = request.Nombre, Contenido = request.Contenido });
}
