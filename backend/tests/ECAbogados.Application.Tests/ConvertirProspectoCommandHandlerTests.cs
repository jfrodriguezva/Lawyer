using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Prospectos.Commands.ConvertirProspecto;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class ConvertirProspectoCommandHandlerTests
{
    private static (ConvertirProspectoCommandHandler Handler, FakeProspectoRepository Prospectos, FakeClienteRepository Clientes, FakeCasoRepository Casos, FakeInvitacionClienteNotifier Notifier) CrearHandler()
    {
        var prospectos = new FakeProspectoRepository();
        var clientes = new FakeClienteRepository();
        var casos = new FakeCasoRepository();
        var checklist = new FakeChecklistItemRepository();
        var notifier = new FakeInvitacionClienteNotifier();
        var handler = new ConvertirProspectoCommandHandler(
            prospectos, clientes, casos, checklist, new FakePasswordHasher(), notifier,
            new FakeAuditoriaRepository(), new FakeCurrentUserAccessor());
        return (handler, prospectos, clientes, casos, notifier);
    }

    [Fact]
    public async Task Convierte_al_prospecto_crea_cliente_y_caso_sin_pedir_password_envia_invitacion()
    {
        var (handler, prospectos, clientes, casos, notifier) = CrearHandler();
        var prospectoId = 0;
        prospectos.Seed(new Prospecto { Nombre = "Ana López", Email = "ana@correo.com", Telefono = "555", FechaCreacion = DateTime.UtcNow });
        prospectoId = (await prospectos.GetAllAsync())[0].Id;

        var resultado = await handler.Handle(
            new ConvertirProspectoCommand(prospectoId, "Divorcio incausado", "notas", null, "Alta", null),
            CancellationToken.None);

        var cliente = await clientes.GetByIdAsync(resultado.ClienteId);
        Assert.NotNull(cliente);
        Assert.True(cliente!.InvitacionPendiente);
        Assert.Single(notifier.Enviados);

        var caso = await casos.GetByIdAsync(resultado.CasoId);
        Assert.NotNull(caso);
        Assert.Equal(resultado.ClienteId, caso!.ClienteId);

        var prospecto = await prospectos.GetByIdAsync(prospectoId);
        Assert.Equal(EtapaProspecto.Contratado, prospecto!.Etapa);
        Assert.Equal(resultado.ClienteId, prospecto.ClienteId);
    }

    [Fact]
    public async Task Prospecto_ya_convertido_lanza_ConflictException()
    {
        var (handler, prospectos, _, _, _) = CrearHandler();
        prospectos.Seed(new Prospecto { Nombre = "Ana López", Email = "ana2@correo.com", Telefono = "555", ClienteId = 99, FechaCreacion = DateTime.UtcNow });
        var prospectoId = (await prospectos.GetAllAsync())[0].Id;

        await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new ConvertirProspectoCommand(prospectoId, "Divorcio incausado", null, null, null, null), CancellationToken.None));
    }

    [Fact]
    public async Task Prospecto_inexistente_lanza_KeyNotFoundException()
    {
        var (handler, _, _, _, _) = CrearHandler();

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            handler.Handle(new ConvertirProspectoCommand(999, "Divorcio incausado", null, null, null, null), CancellationToken.None));
    }
}
