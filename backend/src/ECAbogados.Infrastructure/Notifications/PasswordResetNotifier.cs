using ECAbogados.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECAbogados.Infrastructure.Notifications;

public class PasswordResetNotifier(IEmailSender emailSender, IConfiguration configuration) : IPasswordResetNotifier
{
    public async Task EnviarEnlaceAsync(string email, string token, CancellationToken cancellationToken = default)
    {
        var baseUrl = configuration["Sitio:BaseUrl"] ?? "http://localhost:3000";
        var link = $"{baseUrl}/restablecer-password/{token}";

        await emailSender.SendAsync(
            email,
            "Restablece tu contraseña - EC Abogados",
            $"Recibimos una solicitud para restablecer tu contraseña. Da clic en el siguiente enlace " +
            $"(válido por 1 hora):\n\n{link}\n\nSi tú no solicitaste esto, puedes ignorar este correo.",
            cancellationToken);
    }
}
