using ECAbogados.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECAbogados.Infrastructure.Notifications;

public class InvitacionClienteNotifier(IEmailSender emailSender, IConfiguration configuration) : IInvitacionClienteNotifier
{
    public async Task EnviarInvitacionAsync(string email, string nombre, string token, CancellationToken cancellationToken = default)
    {
        var baseUrl = configuration["Sitio:BaseUrl"] ?? "http://localhost:3000";
        var link = $"{baseUrl}/cliente/activar/{token}";

        await emailSender.SendAsync(
            email,
            "Tu acceso al portal de clientes - ECGAbogados",
            $"Hola {nombre}:\n\nEl despacho creó tu acceso al portal de clientes. Da clic en el siguiente enlace " +
            $"para establecer tu contraseña (válido por 72 horas):\n\n{link}\n\n" +
            "Si no esperabas este correo, puedes ignorarlo.",
            cancellationToken);
    }
}
