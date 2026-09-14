using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeSolicitudCitaNotifier : ISolicitudCitaNotifier
{
    public List<string> ConfirmadasEnviadas { get; } = [];
    public List<string> HorarioAlternativoEnviados { get; } = [];
    public List<string> RechazadasEnviadas { get; } = [];
    public List<string> InformacionRequeridaEnviados { get; } = [];

    public Task NotificarConfirmadaAsync(string email, string nombre, DateTime fechaHora, CancellationToken cancellationToken = default)
    {
        ConfirmadasEnviadas.Add(email);
        return Task.CompletedTask;
    }

    public Task NotificarHorarioAlternativoAsync(string email, string nombre, string tokenPublico, DateTime nuevaFechaHora, CancellationToken cancellationToken = default)
    {
        HorarioAlternativoEnviados.Add(email);
        return Task.CompletedTask;
    }

    public Task NotificarRechazadaAsync(string email, string nombre, string motivo, CancellationToken cancellationToken = default)
    {
        RechazadasEnviadas.Add(email);
        return Task.CompletedTask;
    }

    public Task NotificarInformacionRequeridaAsync(string email, string nombre, string motivo, string tokenPublico, CancellationToken cancellationToken = default)
    {
        InformacionRequeridaEnviados.Add(email);
        return Task.CompletedTask;
    }
}
