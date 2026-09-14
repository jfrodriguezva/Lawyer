using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.ActualizarMiPerfil;

public record ActualizarMiPerfilCommand(string Nombre, string? PasswordActual, string? NuevaPassword) : IRequest;
