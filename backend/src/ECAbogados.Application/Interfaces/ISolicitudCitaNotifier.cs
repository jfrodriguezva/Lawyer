namespace ECAbogados.Application.Interfaces;

/// <summary>
/// Avisa al solicitante (prospecto, cliente o visitante) cada vez que el
/// despacho decide algo sobre su solicitud de cita. Nunca expone el Id
/// interno de la solicitud: usa siempre el TokenPublico.
/// </summary>
public interface ISolicitudCitaNotifier
{
    Task NotificarConfirmadaAsync(string email, string nombre, DateTime fechaHora, CancellationToken cancellationToken = default);

    Task NotificarHorarioAlternativoAsync(string email, string nombre, string tokenPublico, DateTime nuevaFechaHora, CancellationToken cancellationToken = default);

    Task NotificarRechazadaAsync(string email, string nombre, string motivo, CancellationToken cancellationToken = default);

    Task NotificarInformacionRequeridaAsync(string email, string nombre, string motivo, string tokenPublico, CancellationToken cancellationToken = default);
}
