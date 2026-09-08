using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.ActualizarUsuario;

public record ActualizarUsuarioCommand(int Id, string Nombre, string Rol, string? NuevaPassword) : IRequest;
