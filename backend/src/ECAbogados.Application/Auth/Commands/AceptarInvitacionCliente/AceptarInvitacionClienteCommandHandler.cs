using ECAbogados.Application.Auth.Shared;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.AceptarInvitacionCliente;

public class AceptarInvitacionClienteCommandHandler(
    IClienteRepository clienteRepository,
    IPasswordHasher passwordHasher) : IRequestHandler<AceptarInvitacionClienteCommand>
{
    public Task Handle(AceptarInvitacionClienteCommand request, CancellationToken cancellationToken) =>
        PasswordResetService.RestablecerAsync(clienteRepository, passwordHasher, request.Token, request.NuevaPassword);
}
