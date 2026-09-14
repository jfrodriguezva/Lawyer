using ECAbogados.Application.Auth.Shared;
using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.Login;

public class LoginCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await LoginConBloqueoService.AutenticarAsync(
            usuarioRepository, passwordHasher, request.Email, request.Password);

        var token = jwtTokenGenerator.GenerateToken(usuario);

        return new LoginResponse(token, usuario.Nombre, usuario.Email, usuario.Rol);
    }
}
