using System.Net;
using System.Net.Mail;
using ECAbogados.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ECAbogados.Infrastructure.Notifications;

/// <summary>
/// Envío de correo vía SMTP estándar (System.Net.Mail, incluido en .NET, sin costo ni
/// paquetes adicionales). Compatible con cualquier proveedor gratuito (Gmail con
/// "contraseña de aplicación", Brevo free tier, etc.). Si no hay Smtp:Host configurado,
/// solo registra el mensaje en el log (modo desarrollo sin credenciales).
/// </summary>
public class SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var host = configuration["Smtp:Host"];

        if (string.IsNullOrWhiteSpace(to))
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(host))
        {
            logger.LogInformation("[Correo simulado] Para: {To} | Asunto: {Subject} | {Body}", to, subject, body);
            return;
        }

        var port = int.TryParse(configuration["Smtp:Port"], out var p) ? p : 587;
        var user = configuration["Smtp:User"] ?? string.Empty;
        var password = configuration["Smtp:Password"] ?? string.Empty;
        var from = configuration["Smtp:From"] ?? user;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(user, password)
        };

        using var message = new MailMessage(from, to, subject, body);

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "No se pudo enviar el correo a {To}.", to);
        }
    }
}
