using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeInvitacionClienteNotifier : IInvitacionClienteNotifier
{
    public List<(string Email, string Nombre, string Token)> Enviados { get; } = [];

    public Task EnviarInvitacionAsync(string email, string nombre, string token, CancellationToken cancellationToken = default)
    {
        Enviados.Add((email, nombre, token));
        return Task.CompletedTask;
    }
}
