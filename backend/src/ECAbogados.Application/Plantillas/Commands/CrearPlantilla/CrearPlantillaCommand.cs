using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plantillas.Commands.CrearPlantilla;

public record CrearPlantillaCommand(string Nombre, string Contenido) : IRequest<int>;
