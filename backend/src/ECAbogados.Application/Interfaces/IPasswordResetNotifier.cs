namespace ECAbogados.Application.Interfaces;

public interface IPasswordResetNotifier
{
    Task EnviarEnlaceAsync(string email, string token, CancellationToken cancellationToken = default);
}
