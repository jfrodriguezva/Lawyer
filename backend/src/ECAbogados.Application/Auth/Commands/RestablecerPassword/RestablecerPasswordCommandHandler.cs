using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.RestablecerPassword;

public class RestablecerPasswordCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher) : IRequestHandler<RestablecerPasswordCommand>
{
    public async Task Handle(RestablecerPasswordCommand request, CancellationToken cancellationToken)
    {
        var usuario = await usuarioRepository.GetByResetTokenAsync(request.Token);

        if (usuario is null || usuario.ResetTokenExpira is null || usuario.ResetTokenExpira < DateTime.UtcNow)
        {
            throw new InvalidOperationException("El enlace de restablecimiento no es válido o ya expiró.");
        }

        await usuarioRepository.UpdatePasswordHashAsync(usuario.Id, passwordHasher.Hash(request.NuevaPassword));
        await usuarioRepository.SetResetTokenAsync(usuario.Id, null, null);
        await usuarioRepository.UpdateSeguridadLoginAsync(usuario.Id, 0, null);
    }
}
