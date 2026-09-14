using ECAbogados.Application.Auth.Shared;
using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.LoginCliente;

public class LoginClienteCommandHandler(
    IClienteRepository clienteRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<LoginClienteCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginClienteCommand request, CancellationToken cancellationToken)
    {
        var cliente = await LoginConBloqueoService.AutenticarAsync(
            clienteRepository, passwordHasher, request.Email, request.Password);

        var token = jwtTokenGenerator.GenerateTokenParaCliente(cliente);

        return new LoginResponse(token, cliente.Nombre, cliente.Email, "Cliente");
    }
}
