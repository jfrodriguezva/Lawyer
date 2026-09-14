using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plantillas.Commands.ActualizarPlantilla;

public record ActualizarPlantillaCommand(int Id, string Nombre, string Contenido) : IRequest;
