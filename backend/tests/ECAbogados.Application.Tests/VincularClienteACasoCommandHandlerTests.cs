using ECAbogados.Application.Casos.Commands.VincularClienteACaso;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class VincularClienteACasoCommandHandlerTests
{
    [Fact]
    public async Task Vincula_el_cliente_al_caso_y_registra_auditoria()
    {
        var casos = new FakeCasoRepository();
        var auditoria = new FakeAuditoriaRepository();
        var currentUser = new FakeCurrentUserAccessor();
        casos.Seed(new Caso { ClienteNombre = "Cliente Uno", Tipo = "Divorcio incausado" });

        var handler = new VincularClienteACasoCommandHandler(casos, auditoria, currentUser);

        await handler.Handle(new VincularClienteACasoCommand(1, 7), CancellationToken.None);

        var caso = await casos.GetByIdAsync(1);
        Assert.Equal(7, caso!.ClienteId);
        Assert.Single(auditoria.Entradas);
        Assert.Equal("Caso", auditoria.Entradas[0].Entidad);
    }
}
