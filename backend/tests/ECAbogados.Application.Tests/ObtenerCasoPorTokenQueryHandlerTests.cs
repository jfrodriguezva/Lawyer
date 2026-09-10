using ECAbogados.Application.Casos.Queries.ObtenerCasoPorToken;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class ObtenerCasoPorTokenQueryHandlerTests
{
    private static (ObtenerCasoPorTokenQueryHandler Handler, FakeCasoRepository Casos) CrearHandler()
    {
        var casos = new FakeCasoRepository();
        var handler = new ObtenerCasoPorTokenQueryHandler(casos, new FakeDocumentoRepository(), new FakeChecklistItemRepository());
        return (handler, casos);
    }

    [Fact]
    public async Task Token_expirado_devuelve_null()
    {
        var (handler, casos) = CrearHandler();
        casos.Seed(new Caso
        {
            ClienteNombre = "Cliente",
            Tipo = "Divorcio",
            TokenAcceso = "token-viejo",
            TokenGeneradoEn = DateTime.UtcNow.AddDays(-181),
        });

        var resultado = await handler.Handle(new ObtenerCasoPorTokenQuery("token-viejo"), CancellationToken.None);

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Token_inexistente_devuelve_null()
    {
        var (handler, _) = CrearHandler();

        var resultado = await handler.Handle(new ObtenerCasoPorTokenQuery("no-existe"), CancellationToken.None);

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Token_vigente_devuelve_el_caso()
    {
        var (handler, casos) = CrearHandler();
        casos.Seed(new Caso
        {
            ClienteNombre = "Cliente",
            Tipo = "Divorcio",
            TokenAcceso = "token-vigente",
            TokenGeneradoEn = DateTime.UtcNow.AddDays(-1),
        });

        var resultado = await handler.Handle(new ObtenerCasoPorTokenQuery("token-vigente"), CancellationToken.None);

        Assert.NotNull(resultado);
        Assert.Equal("Cliente", resultado!.ClienteNombre);
    }
}
