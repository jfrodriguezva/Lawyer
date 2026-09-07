using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.CrearUsuario;

public record CrearUsuarioCommand(string Email, string Password, string Nombre, string Rol) : IRequest<int>;
