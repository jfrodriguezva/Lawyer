using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Modulos.Commands.EliminarModulo;

public record EliminarModuloCommand(int Id) : IRequest;
