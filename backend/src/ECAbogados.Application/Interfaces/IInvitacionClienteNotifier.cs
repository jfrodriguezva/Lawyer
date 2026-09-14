namespace ECAbogados.Application.Interfaces;

public interface IInvitacionClienteNotifier
{
    Task EnviarInvitacionAsync(string email, string nombre, string token, CancellationToken cancellationToken = default);
}
