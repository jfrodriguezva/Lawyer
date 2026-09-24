using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Modulos.Commands.ActualizarModulo;

public record ActualizarModuloCommand(int Id, string Nombre, string Slug, string RolResponsable, int Orden) : IRequest;
