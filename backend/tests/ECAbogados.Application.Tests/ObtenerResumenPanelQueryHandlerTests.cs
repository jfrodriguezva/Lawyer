using ECAbogados.Application.Dashboard.Queries.ObtenerResumenPanel;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class ObtenerResumenPanelQueryHandlerTests
{
    private readonly FakeCitaRepository _citas = new();
    private readonly FakeMensajeContactoRepository _mensajes = new();
    private readonly FakeSolicitudCitaRepository _solicitudes = new();

    private ObtenerResumenPanelQueryHandler CrearHandler() => new(_citas, _mensajes, _solicitudes);

    private async Task SeedCita(string nombre, DateTime fechaHora, EstatusCita estatus) =>
        await _citas.CreateAsync(new Cita { NombreCliente = nombre, Telefono = "5555555555", FechaHora = fechaHora, Estatus = estatus });

    [Fact]
    public async Task Proximas_citas_excluye_pasadas_y_canceladas_y_ordena_de_la_mas_cercana()
    {
        var ahora = DateTime.UtcNow;
        await SeedCita("Pasada hace un año", ahora.AddYears(-1), EstatusCita.Confirmada);
        await SeedCita("Pasada ayer", ahora.AddDays(-1), EstatusCita.Pendiente);
        await SeedCita("Cancelada mañana", ahora.AddDays(1), EstatusCita.Cancelada);
        await SeedCita("En 3 días", ahora.AddDays(3), EstatusCita.Pendiente);
        await SeedCita("En 2 horas", ahora.AddHours(2), EstatusCita.Confirmada);
        for (var i = 0; i < 5; i++)
        {
            await SeedCita($"Lejana {i}", ahora.AddDays(30 + i), EstatusCita.Pendiente);
        }

        var resumen = await CrearHandler().Handle(new ObtenerResumenPanelQuery(null), CancellationToken.None);

        Assert.Equal(5, resumen.ProximasCitas.Count);
        Assert.Equal("En 2 horas", resumen.ProximasCitas[0].NombreCliente);
        Assert.Equal("En 3 días", resumen.ProximasCitas[1].NombreCliente);
        Assert.DoesNotContain(resumen.ProximasCitas, c => c.NombreCliente.StartsWith("Pasada") || c.Estatus == EstatusCita.Cancelada);
    }

    [Fact]
    public async Task Calcula_tasas_redondeadas_y_cero_sin_datos()
    {
        var vacio = await CrearHandler().Handle(new ObtenerResumenPanelQuery(null), CancellationToken.None);
        Assert.Equal(0, vacio.TasaConfirmacionCitas);
        Assert.Equal(0, vacio.TasaAtencionMensajes);

        // 2 de 3 confirmadas = 66.67% -> 67
        await SeedCita("A", DateTime.UtcNow, EstatusCita.Confirmada);
        await SeedCita("B", DateTime.UtcNow, EstatusCita.Confirmada);
        await SeedCita("C", DateTime.UtcNow, EstatusCita.Pendiente);
        // 1 de 8 atendidos = 12.5% -> 13
        for (var i = 0; i < 8; i++)
        {
            _mensajes.Seed(new MensajeContacto { Nombre = $"M{i}", Atendido = i == 0 });
        }

        var resumen = await CrearHandler().Handle(new ObtenerResumenPanelQuery(null), CancellationToken.None);

        Assert.Equal(67, resumen.TasaConfirmacionCitas);
        Assert.Equal(13, resumen.TasaAtencionMensajes);
    }

    [Fact]
    public async Task Solicitudes_pendientes_filtra_por_estatus_y_modulo()
    {
        var ahora = DateTime.UtcNow;
        for (var i = 0; i < 7; i++)
        {
            await _solicitudes.CreateAsync(new SolicitudCita
            {
                NombreSolicitante = $"Pendiente {i}",
                Modulo = ModuloSolicitud.Abogado,
                Estatus = EstatusSolicitudCita.SolicitudRecibida,
                FechaCreacion = ahora.AddMinutes(-i)
            });
        }
        await _solicitudes.CreateAsync(new SolicitudCita { NombreSolicitante = "Confirmada", Modulo = ModuloSolicitud.Abogado, Estatus = EstatusSolicitudCita.Confirmada, FechaCreacion = ahora });
        await _solicitudes.CreateAsync(new SolicitudCita { NombreSolicitante = "SAT", Modulo = ModuloSolicitud.SAT, Estatus = EstatusSolicitudCita.EnRevision, FechaCreacion = ahora });

        var abogado = await CrearHandler().Handle(new ObtenerResumenPanelQuery(ModuloSolicitud.Abogado), CancellationToken.None);
        var administrador = await CrearHandler().Handle(new ObtenerResumenPanelQuery(null), CancellationToken.None);

        Assert.Equal(7, abogado.SolicitudesPendientes);
        Assert.Equal(5, abogado.SolicitudesPendientesRecientes.Count);
        Assert.Equal("Pendiente 0", abogado.SolicitudesPendientesRecientes[0].NombreSolicitante);
        Assert.DoesNotContain(abogado.SolicitudesPendientesRecientes, s => s.NombreSolicitante is "SAT" or "Confirmada");
        Assert.Equal(8, administrador.SolicitudesPendientes);
    }
}
