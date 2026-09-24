using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Modulos.Commands.CambiarActivoModulo;

public record CambiarActivoModuloCommand(int Id, bool Activo) : IRequest;
