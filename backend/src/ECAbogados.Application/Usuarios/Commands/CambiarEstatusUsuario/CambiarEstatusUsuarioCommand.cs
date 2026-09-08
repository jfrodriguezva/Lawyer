using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.CambiarEstatusUsuario;

public record CambiarEstatusUsuarioCommand(int Id, bool Activo) : IRequest;
