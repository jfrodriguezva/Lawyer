using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ECAbogados.Infrastructure.Notifications;

/// <summary>
/// Servicio en segundo plano (built-in .NET BackgroundService, sin Hangfire ni
/// dependencias externas) que revisa periódicamente citas próximas a 24h y plazos
/// próximos a vencer, y avisa al staff por correo. Cero costo.
/// </summary>
public class RecordatorioBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<RecordatorioBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan Intervalo = TimeSpan.FromMinutes(30);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Intervalo);

        do
        {
            try
            {
                await RevisarAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al revisar recordatorios/plazos.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task RevisarAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var citaRepository = scope.ServiceProvider.GetRequiredService<ICitaRepository>();
        var plazoRepository = scope.ServiceProvider.GetRequiredService<IPlazoRepository>();
        var staffNotifier = scope.ServiceProvider.GetRequiredService<IStaffNotifier>();

        var ahora = DateTime.UtcNow;
        var limite24h = ahora.AddHours(24);

        var citas = await citaRepository.GetAllAsync();
        var citasAConfirmar = citas.Where(c =>
            c.Estatus == EstatusCita.Confirmada &&
            !c.RecordatorioEnviado &&
            c.FechaHora >= ahora &&
            c.FechaHora <= limite24h);

        foreach (var cita in citasAConfirmar)
        {
            await staffNotifier.NotifyAsync(
                "Recordatorio: cita en menos de 24 horas",
                $"{cita.NombreCliente} ({cita.Telefono}) tiene cita el {cita.FechaHora:dd/MM/yyyy HH:mm}.",
                cancellationToken);

            await citaRepository.MarkRecordatorioEnviadoAsync(cita.Id);
        }

        var plazosProximos = await plazoRepository.GetProximosSinAlertaAsync(ahora.AddDays(3));

        foreach (var plazo in plazosProximos)
        {
            await staffNotifier.NotifyAsync(
                "Alerta de plazo próximo a vencer",
                $"El plazo \"{plazo.Descripcion}\" del caso #{plazo.CasoId} vence el {plazo.FechaLimite:dd/MM/yyyy}.",
                cancellationToken);

            await plazoRepository.MarkAlertaEnviadaAsync(plazo.Id);
        }
    }
}
