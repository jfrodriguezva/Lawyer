using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeStaffNotifier : IStaffNotifier
{
    public List<(string Subject, string Body)> Notificaciones { get; } = [];

    public Task NotifyAsync(string subject, string body, CancellationToken cancellationToken = default)
    {
        Notificaciones.Add((subject, body));
        return Task.CompletedTask;
    }
}
