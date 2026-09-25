using ECAbogados.Application.Casos.Queries.ObtenerResumenCasos;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class ObtenerResumenCasosQueryHandlerTests
{
    [Fact]
    public async Task Cuenta_por_estatus_y_trae_solo_los_5_activos_mas_recientes()
    {
        var casos = new FakeCasoRepository();
        var usuarios = new FakeUsuarioRepository();
        usuarios.Seed(new Usuario { Nombre = "Lic. Erika Cruz García" });

        for (var i = 0; i < 7; i++)
        {
            casos.Seed(new Caso
            {
                ClienteNombre = $"Cliente {i}",
                Tipo = "Divorcio incausado",
                Estatus = EstatusCaso.Activo,
                FechaApertura = DateTime.UtcNow.AddDays(-i),
                AbogadoResponsableId = 1
            });
        }
        casos.Seed(new Caso { ClienteNombre = "En revisión", Tipo = "SAT", Estatus = EstatusCaso.Revision, FechaApertura = DateTime.UtcNow });
        casos.Seed(new Caso { ClienteNombre = "Cerrado", Tipo = "SAT", Estatus = EstatusCaso.Cerrado, FechaApertura = DateTime.UtcNow });

        var handler = new ObtenerResumenCasosQueryHandler(casos, usuarios);

        var resumen = await handler.Handle(new ObtenerResumenCasosQuery(), CancellationToken.None);

        Assert.Equal(7, resumen.Activos);
        Assert.Equal(1, resumen.EnRevision);
        Assert.Equal(1, resumen.Cerrados);
        Assert.Equal(5, resumen.ActivosRecientes.Count);
        // El más reciente (FechaApertura = hoy, i = 0) debe ir primero.
        Assert.Equal("Cliente 0", resumen.ActivosRecientes[0].ClienteNombre);
        Assert.All(resumen.ActivosRecientes, c => Assert.Equal("Lic. Erika Cruz García", c.AbogadoResponsableNombre));
    }

    [Fact]
    public async Task Sin_casos_devuelve_conteos_en_cero_y_lista_vacia()
    {
        var handler = new ObtenerResumenCasosQueryHandler(new FakeCasoRepository(), new FakeUsuarioRepository());

        var resumen = await handler.Handle(new ObtenerResumenCasosQuery(), CancellationToken.None);

        Assert.Equal(0, resumen.Activos);
        Assert.Equal(0, resumen.EnRevision);
        Assert.Equal(0, resumen.Cerrados);
        Assert.Empty(resumen.ActivosRecientes);
    }
}
