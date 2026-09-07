namespace ECAbogados.Application.Interfaces;

public interface IStaffNotifier
{
    Task NotifyAsync(string subject, string body, CancellationToken cancellationToken = default);
}
