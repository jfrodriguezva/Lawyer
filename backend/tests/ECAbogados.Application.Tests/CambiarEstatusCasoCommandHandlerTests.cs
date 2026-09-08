using ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class CambiarEstatusCasoCommandHandlerTests
{
    [Fact]
    public async Task Caso_inexistente_lanza_KeyNotFoundException()
    {
        var handler = new CambiarEstatusCasoCommandHandler(new FakeCasoRepository(), new FakeAuditoriaRepository(), new FakeCurrentUserAccessor());

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            handler.Handle(new CambiarEstatusCasoCommand(999, EstatusCaso.Cerrado), CancellationToken.None));
    }

    [Fact]
    public async Task Caso_existente_actualiza_estatus()
    {
        var casos = new FakeCasoRepository();
        var id = await casos.CreateAsync(new Caso { ClienteNombre = "Cliente", Tipo = "Divorcio", Estatus = EstatusCaso.Activo, FechaApertura = DateTime.UtcNow });
        var handler = new CambiarEstatusCasoCommandHandler(casos, new FakeAuditoriaRepository(), new FakeCurrentUserAccessor());

        await handler.Handle(new CambiarEstatusCasoCommand(id, EstatusCaso.Cerrado), CancellationToken.None);

        var caso = await casos.GetByIdAsync(id);
        Assert.Equal(EstatusCaso.Cerrado, caso!.Estatus);
    }
}
