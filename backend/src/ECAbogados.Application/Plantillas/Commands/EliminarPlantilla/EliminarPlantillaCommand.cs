using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plantillas.Commands.EliminarPlantilla;

public record EliminarPlantillaCommand(int Id) : IRequest;
