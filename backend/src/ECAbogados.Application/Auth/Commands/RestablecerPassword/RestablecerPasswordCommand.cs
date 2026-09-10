using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.RestablecerPassword;

public record RestablecerPasswordCommand(string Token, string NuevaPassword) : IRequest;
