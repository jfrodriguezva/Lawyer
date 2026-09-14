using ECAbogados.Application.Auth.Shared;
using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Clientes.Commands.InvitarCliente;

public class InvitarClienteCommandHandler(
    IClienteRepository clienteRepository,
    IProspectoRepository prospectoRepository,
    IPasswordHasher passwordHasher,
    IInvitacionClienteNotifier invitacionNotifier) : IRequestHandler<InvitarClienteCommand, int>
{
    private static readonly TimeSpan VigenciaInvitacion = TimeSpan.FromHours(72);

    public async Task<int> Handle(InvitarClienteCommand request, CancellationToken cancellationToken)
    {
        var existente = await clienteRepository.GetByEmailAsync(request.Email);
        if (existente is not null)
        {
            throw new ConflictException("Ya existe un cliente con ese correo.");
        }

        // Contraseña temporal inutilizable: nadie puede iniciar sesión hasta
        // que el cliente establezca la suya propia a través del enlace de invitación.
        var cliente = new Cliente
        {
            Email = request.Email,
            Nombre = request.Nombre,
            PasswordHash = passwordHasher.Hash(Guid.NewGuid().ToString()),
            InvitacionPendiente = true,
            FechaCreacion = DateTime.UtcNow
        };

        var id = await clienteRepository.CreateAsync(cliente);

        if (request.ProspectoId is int prospectoId)
        {
            await prospectoRepository.VincularClienteAsync(prospectoId, id);
        }

        var token = await PasswordResetService.GenerarTokenAsync(clienteRepository, id, VigenciaInvitacion);
        await invitacionNotifier.EnviarInvitacionAsync(request.Email, request.Nombre, token, cancellationToken);

        return id;
    }
}
