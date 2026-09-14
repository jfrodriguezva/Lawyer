using ECAbogados.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECAbogados.Infrastructure.Notifications;

public class SolicitudCitaNotifier(IEmailSender emailSender, IConfiguration configuration) : ISolicitudCitaNotifier
{
    private string BaseUrl => configuration["Sitio:BaseUrl"] ?? "http://localhost:3000";

    public Task NotificarConfirmadaAsync(string email, string nombre, DateTime fechaHora, CancellationToken cancellationToken = default) =>
        emailSender.SendAsync(
            email,
            "Tu cita fue confirmada - ECGAbogados",
            $"Hola {nombre}:\n\nTu cita quedó confirmada para el {fechaHora:dd/MM/yyyy 'a las' HH:mm}. " +
            "Te esperamos.",
            cancellationToken);

    public Task NotificarHorarioAlternativoAsync(string email, string nombre, string tokenPublico, DateTime nuevaFechaHora, CancellationToken cancellationToken = default) =>
        emailSender.SendAsync(
            email,
            "Propuesta de nuevo horario para tu cita - ECGAbogados",
            $"Hola {nombre}:\n\nEl despacho propone el {nuevaFechaHora:dd/MM/yyyy 'a las' HH:mm} para tu cita. " +
            $"Confirma o propón otro horario aquí:\n\n{BaseUrl}/solicitud/{tokenPublico}",
            cancellationToken);

    public Task NotificarRechazadaAsync(string email, string nombre, string motivo, CancellationToken cancellationToken = default) =>
        emailSender.SendAsync(
            email,
            "Sobre tu solicitud de cita - ECGAbogados",
            $"Hola {nombre}:\n\nLamentamos informarte que no fue posible atender tu solicitud de cita. Motivo: {motivo}\n\n" +
            "Puedes solicitar una nueva cita cuando gustes.",
            cancellationToken);

    public Task NotificarInformacionRequeridaAsync(string email, string nombre, string motivo, string tokenPublico, CancellationToken cancellationToken = default) =>
        emailSender.SendAsync(
            email,
            "Necesitamos información adicional - ECGAbogados",
            $"Hola {nombre}:\n\nPara continuar con tu solicitud de cita necesitamos lo siguiente: {motivo}\n\n" +
            $"Consulta el estado de tu solicitud aquí:\n\n{BaseUrl}/solicitud/{tokenPublico}",
            cancellationToken);
}
