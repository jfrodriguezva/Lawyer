using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plantillas.Commands.EliminarPlantilla;

public class EliminarPlantillaCommandHandler(IPlantillaMensajeRepository plantillaRepository) : IRequestHandler<EliminarPlantillaCommand>
{
    public Task Handle(EliminarPlantillaCommand request, CancellationToken cancellationToken) =>
        plantillaRepository.DeleteAsync(request.Id);
}
