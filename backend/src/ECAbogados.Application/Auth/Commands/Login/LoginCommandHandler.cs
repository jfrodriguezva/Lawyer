using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.Login;

public class LoginCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<LoginCommand, LoginResponse>
{
    private const int MaxIntentosFallidos = 5;
    private static readonly TimeSpan DuracionBloqueo = TimeSpan.FromMinutes(15);

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await usuarioRepository.GetByEmailAsync(request.Email);

        if (usuario is null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (usuario.BloqueadoHasta is not null && usuario.BloqueadoHasta > DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException(
                "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en unos minutos.");
        }

        if (!passwordHasher.Verify(request.Password, usuario.PasswordHash))
        {
            var intentos = usuario.IntentosFallidos + 1;
            DateTime? bloqueadoHasta = null;

            if (intentos >= MaxIntentosFallidos)
            {
                bloqueadoHasta = DateTime.UtcNow.Add(DuracionBloqueo);
                intentos = 0; // al desbloquearse, empieza con el contador limpio
            }

            await usuarioRepository.UpdateSeguridadLoginAsync(usuario.Id, intentos, bloqueadoHasta);

            throw bloqueadoHasta is not null
                ? new UnauthorizedAccessException(
                    "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en unos minutos.")
                : new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (!usuario.Activo)
        {
            // Mismo mensaje que credenciales inválidas: no revelar que la cuenta existe pero está desactivada.
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (usuario.IntentosFallidos != 0 || usuario.BloqueadoHasta is not null)
        {
            await usuarioRepository.UpdateSeguridadLoginAsync(usuario.Id, 0, null);
        }

        var token = jwtTokenGenerator.GenerateToken(usuario);

        return new LoginResponse(token, usuario.Nombre, usuario.Email, usuario.Rol);
    }
}
