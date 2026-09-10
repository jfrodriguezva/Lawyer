using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.SolicitarResetPassword;

public class SolicitarResetPasswordCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordResetNotifier passwordResetNotifier) : IRequestHandler<SolicitarResetPasswordCommand>
{
    public async Task Handle(SolicitarResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var usuario = await usuarioRepository.GetByEmailAsync(request.Email);

        // No revelar si el correo existe o no: siempre "éxito" desde afuera.
        if (usuario is null || !usuario.Activo)
        {
            return;
        }

        var token = Guid.NewGuid().ToString("N");
        await usuarioRepository.SetResetTokenAsync(usuario.Id, token, DateTime.UtcNow.AddHours(1));
        await passwordResetNotifier.EnviarEnlaceAsync(usuario.Email, token, cancellationToken);
    }
}
