using ECAbogados.Application.Citas.SolicitudesCita.Commands.RevisarSolicitudCita;
using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class RevisarSolicitudCitaCommandHandlerTests
{
    private static (RevisarSolicitudCitaCommandHandler Handler, FakeSolicitudCitaRepository Solicitudes, FakeCitaRepository Citas, FakeSolicitudCitaNotifier Notifier) CrearHandler()
    {
        var solicitudes = new FakeSolicitudCitaRepository();
        var citas = new FakeCitaRepository();
        var notifier = new FakeSolicitudCitaNotifier();
        var handler = new RevisarSolicitudCitaCommandHandler(solicitudes, citas, notifier, new FakeAuditoriaRepository(), new FakeCurrentUserAccessor());
        return (handler, solicitudes, citas, notifier);
    }

    private static async Task<int> SembrarSolicitud(FakeSolicitudCitaRepository solicitudes, DateTime fechaHora)
    {
        return await solicitudes.CreateAsync(new SolicitudCita
        {
            NombreSolicitante = "Juan Pérez",
            EmailSolicitante = "juan@correo.com",
            TelefonoSolicitante = "5511112222",
            Modulo = ModuloSolicitud.Abogado,
            FechaHoraPropuesta = fechaHora,
            Modalidad = ModalidadCita.Presencial,
            Estatus = EstatusSolicitudCita.SolicitudRecibida,
            FechaCreacion = DateTime.UtcNow,
            TokenPublico = Guid.NewGuid().ToString("N")
        });
    }

    [Fact]
    public async Task Aceptar_confirma_la_solicitud_y_crea_la_cita()
    {
        var (handler, solicitudes, citas, notifier) = CrearHandler();
        var fecha = DateTime.UtcNow.AddDays(2);
        var id = await SembrarSolicitud(solicitudes, fecha);

        await handler.Handle(new RevisarSolicitudCitaCommand(id, AccionRevisionSolicitud.Aceptar, null, null), CancellationToken.None);

        var solicitud = await solicitudes.GetByIdAsync(id);
        Assert.Equal(EstatusSolicitudCita.Confirmada, solicitud!.Estatus);
        Assert.NotNull(solicitud.CitaId);
        Assert.Single(await citas.GetAllAsync());
        Assert.Single(notifier.ConfirmadasEnviadas);
    }

    [Fact]
    public async Task Aceptar_con_horario_ya_confirmado_lanza_ConflictException()
    {
        var (handler, solicitudes, citas, _) = CrearHandler();
        var fecha = DateTime.UtcNow.AddDays(2);
        await citas.CreateAsync(new Cita { NombreCliente = "Otro", Telefono = "555", FechaHora = fecha, Estatus = EstatusCita.Confirmada });
        var id = await SembrarSolicitud(solicitudes, fecha);

        await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new RevisarSolicitudCitaCommand(id, AccionRevisionSolicitud.Aceptar, null, null), CancellationToken.None));
    }

    [Fact]
    public async Task ProponerOtroHorario_actualiza_la_fecha_y_registra_historial()
    {
        var (handler, solicitudes, _, notifier) = CrearHandler();
        var id = await SembrarSolicitud(solicitudes, DateTime.UtcNow.AddDays(2));
        var nuevaFecha = DateTime.UtcNow.AddDays(5);

        await handler.Handle(new RevisarSolicitudCitaCommand(id, AccionRevisionSolicitud.ProponerOtroHorario, nuevaFecha, "Agenda ocupada"), CancellationToken.None);

        var solicitud = await solicitudes.GetByIdAsync(id);
        Assert.Equal(EstatusSolicitudCita.HorarioAlternativoPropuesto, solicitud!.Estatus);
        Assert.Equal(nuevaFecha, solicitud.FechaHoraPropuesta);
        Assert.Single(await solicitudes.GetHistorialAsync(id));
        Assert.Single(notifier.HorarioAlternativoEnviados);
    }

    [Fact]
    public async Task Rechazar_requiere_motivo_y_cambia_el_estatus()
    {
        var (handler, solicitudes, _, notifier) = CrearHandler();
        var id = await SembrarSolicitud(solicitudes, DateTime.UtcNow.AddDays(2));

        await handler.Handle(new RevisarSolicitudCitaCommand(id, AccionRevisionSolicitud.Rechazar, null, "No hay disponibilidad"), CancellationToken.None);

        var solicitud = await solicitudes.GetByIdAsync(id);
        Assert.Equal(EstatusSolicitudCita.Rechazada, solicitud!.Estatus);
        Assert.Equal("No hay disponibilidad", solicitud.Motivo);
        Assert.Single(notifier.RechazadasEnviadas);
    }
}
