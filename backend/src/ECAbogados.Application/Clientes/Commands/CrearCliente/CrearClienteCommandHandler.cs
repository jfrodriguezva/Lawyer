using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Clientes.Commands.CrearCliente;

public class CrearClienteCommandHandler(
    IClienteRepository clienteRepository,
    IPasswordHasher passwordHasher) : IRequestHandler<CrearClienteCommand, int>
{
    public async Task<int> Handle(CrearClienteCommand request, CancellationToken cancellationToken)
    {
        var existente = await clienteRepository.GetByEmailAsync(request.Email);
        if (existente is not null)
        {
            throw new InvalidOperationException("Ya existe un cliente con ese correo.");
        }

        var cliente = new Cliente
        {
            Email = request.Email,
            PasswordHash = passwordHasher.Hash(request.Password),
            Nombre = request.Nombre
        };

        return await clienteRepository.CreateAsync(cliente);
    }
}
