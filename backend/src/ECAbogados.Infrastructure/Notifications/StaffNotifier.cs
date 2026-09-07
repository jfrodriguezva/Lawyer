using ECAbogados.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECAbogados.Infrastructure.Notifications;

public class StaffNotifier(IEmailSender emailSender, IConfiguration configuration) : IStaffNotifier
{
    public async Task NotifyAsync(string subject, string body, CancellationToken cancellationToken = default)
    {
        var staffEmail = configuration["Notificaciones:StaffEmail"];
        if (string.IsNullOrWhiteSpace(staffEmail))
        {
            return;
        }

        await emailSender.SendAsync(staffEmail, subject, body, cancellationToken);
    }
}
