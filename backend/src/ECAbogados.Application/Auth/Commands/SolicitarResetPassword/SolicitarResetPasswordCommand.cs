using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.SolicitarResetPassword;

public record SolicitarResetPasswordCommand(string Email) : IRequest;
