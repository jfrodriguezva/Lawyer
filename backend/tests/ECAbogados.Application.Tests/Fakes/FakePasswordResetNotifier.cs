using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Tests.Fakes;

public class FakePasswordResetNotifier : IPasswordResetNotifier
{
    public List<(string Email, string Token)> Enviados { get; } = [];

    public Task EnviarEnlaceAsync(string email, string token, CancellationToken cancellationToken = default)
    {
        Enviados.Add((email, token));
        return Task.CompletedTask;
    }
}
