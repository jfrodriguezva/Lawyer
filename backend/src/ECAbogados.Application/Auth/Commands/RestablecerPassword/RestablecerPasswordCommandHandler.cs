using ECAbogados.Application.Auth.Shared;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.RestablecerPassword;

public class RestablecerPasswordCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher) : IRequestHandler<RestablecerPasswordCommand>
{
    public Task Handle(RestablecerPasswordCommand request, CancellationToken cancellationToken) =>
        PasswordResetService.RestablecerAsync(usuarioRepository, passwordHasher, request.Token, request.NuevaPassword);
}
