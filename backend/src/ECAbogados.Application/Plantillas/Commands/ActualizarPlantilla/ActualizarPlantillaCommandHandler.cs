using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plantillas.Commands.ActualizarPlantilla;

public class ActualizarPlantillaCommandHandler(IPlantillaMensajeRepository plantillaRepository) : IRequestHandler<ActualizarPlantillaCommand>
{
    public async Task Handle(ActualizarPlantillaCommand request, CancellationToken cancellationToken)
    {
        var plantilla = await plantillaRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró la plantilla con Id {request.Id}");

        plantilla.Nombre = request.Nombre;
        plantilla.Contenido = request.Contenido;

        await plantillaRepository.UpdateAsync(plantilla);
    }
}
