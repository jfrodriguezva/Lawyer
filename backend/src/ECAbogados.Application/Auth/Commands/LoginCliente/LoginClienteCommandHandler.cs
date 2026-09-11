using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.LoginCliente;

public class LoginClienteCommandHandler(
    IClienteRepository clienteRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<LoginClienteCommand, LoginResponse>
{
    private const int MaxIntentosFallidos = 5;
    private static readonly TimeSpan DuracionBloqueo = TimeSpan.FromMinutes(15);

    public async Task<LoginResponse> Handle(LoginClienteCommand request, CancellationToken cancellationToken)
    {
        var cliente = await clienteRepository.GetByEmailAsync(request.Email);

        if (cliente is null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (cliente.BloqueadoHasta is not null && cliente.BloqueadoHasta > DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException(
                "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en unos minutos.");
        }

        if (!passwordHasher.Verify(request.Password, cliente.PasswordHash))
        {
            var intentos = cliente.IntentosFallidos + 1;
            DateTime? bloqueadoHasta = null;

            if (intentos >= MaxIntentosFallidos)
            {
                bloqueadoHasta = DateTime.UtcNow.Add(DuracionBloqueo);
                intentos = 0;
            }

            await clienteRepository.UpdateSeguridadLoginAsync(cliente.Id, intentos, bloqueadoHasta);

            throw bloqueadoHasta is not null
                ? new UnauthorizedAccessException(
                    "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en unos minutos.")
                : new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (!cliente.Activo)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (cliente.IntentosFallidos != 0 || cliente.BloqueadoHasta is not null)
        {
            await clienteRepository.UpdateSeguridadLoginAsync(cliente.Id, 0, null);
        }

        var token = jwtTokenGenerator.GenerateTokenParaCliente(cliente);

        return new LoginResponse(token, cliente.Nombre, cliente.Email, "Cliente");
    }
}
