using ECAbogados.Application.Citas.SolicitudesCita.Commands.CrearSolicitudCita;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class CrearSolicitudCitaCommandHandlerTests
{
    private static (CrearSolicitudCitaCommandHandler Handler, FakeSolicitudCitaRepository Solicitudes, FakeProspectoRepository Prospectos, FakeClienteRepository Clientes) CrearHandler()
    {
        var solicitudes = new FakeSolicitudCitaRepository();
        var prospectos = new FakeProspectoRepository();
        var clientes = new FakeClienteRepository();
        var usuarios = new FakeUsuarioRepository();
        var notificaciones = new FakeNotificacionRepository();
        var handler = new CrearSolicitudCitaCommandHandler(solicitudes, prospectos, clientes, usuarios, notificaciones, new FakeStaffNotifier());
        return (handler, solicitudes, prospectos, clientes);
    }

    private static CrearSolicitudCitaCommand Comando(string email = "nuevo@correo.com") => new(
        "Juan Pérez", email, "5511112222", "WhatsApp", ModuloSolicitud.Abogado,
        "Divorcio incausado", "Quiero información", DateTime.UtcNow.AddDays(3), ModalidadCita.Videollamada, true);

    [Fact]
    public async Task Correo_nuevo_crea_un_prospecto_y_la_solicitud_queda_recibida()
    {
        var (handler, solicitudes, prospectos, _) = CrearHandler();

        var resultado = await handler.Handle(Comando(), CancellationToken.None);

        var solicitud = await solicitudes.GetByIdAsync(resultado.Id);
        Assert.NotNull(solicitud);
        Assert.Equal(EstatusSolicitudCita.SolicitudRecibida, solicitud!.Estatus);
        Assert.NotNull(solicitud.ProspectoId);
        Assert.False(string.IsNullOrWhiteSpace(resultado.TokenPublico));

        var prospectosCreados = await prospectos.GetAllAsync();
        Assert.Single(prospectosCreados);
    }

    [Fact]
    public async Task Correo_repetido_reutiliza_el_mismo_prospecto()
    {
        var (handler, _, prospectos, _) = CrearHandler();

        await handler.Handle(Comando("repetido@correo.com"), CancellationToken.None);
        await handler.Handle(Comando("repetido@correo.com"), CancellationToken.None);

        var prospectosCreados = await prospectos.GetAllAsync();
        Assert.Single(prospectosCreados);
    }

    [Fact]
    public async Task Correo_de_un_cliente_existente_no_crea_prospecto()
    {
        var (handler, solicitudes, prospectos, clientes) = CrearHandler();
        var clienteId = await clientes.CreateAsync(new Cliente { Email = "cliente@correo.com", Nombre = "Cliente Existente", PasswordHash = "x" });

        var resultado = await handler.Handle(Comando("cliente@correo.com"), CancellationToken.None);

        var solicitud = await solicitudes.GetByIdAsync(resultado.Id);
        Assert.Equal(clienteId, solicitud!.ClienteId);
        Assert.Null(solicitud.ProspectoId);
        Assert.Empty(await prospectos.GetAllAsync());
    }
}
