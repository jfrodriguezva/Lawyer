using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Modulos.Commands.CrearModulo;

public record CrearModuloCommand(string Nombre, string Slug, string RolResponsable, int Orden) : IRequest<int>;
