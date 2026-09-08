using ECAbogados.Application.Casos.Commands.CrearCaso;
using ECAbogados.Application.Tests.Fakes;

namespace ECAbogados.Application.Tests;

public class CrearCasoCommandHandlerTests
{
    [Fact]
    public async Task Genera_token_de_portal_y_siembra_checklist_segun_tipo()
    {
        var casos = new FakeCasoRepository();
        var checklist = new FakeChecklistItemRepository();
        var auditoria = new FakeAuditoriaRepository();
        var handler = new CrearCasoCommandHandler(casos, checklist, auditoria, new FakeCurrentUserAccessor());

        var id = await handler.Handle(new CrearCasoCommand("Cliente Prueba", "Custodia", "notas"), CancellationToken.None);

        var caso = await casos.GetByIdAsync(id);
        Assert.NotNull(caso);
        Assert.False(string.IsNullOrWhiteSpace(caso!.TokenAcceso));
        Assert.NotNull(caso.TokenGeneradoEn);

        var items = await checklist.GetByCasoIdAsync(id);
        Assert.NotEmpty(items);
        Assert.Contains(items, i => i.Descripcion.Contains("convivencia", StringComparison.OrdinalIgnoreCase));

        Assert.Contains(auditoria.Entradas, e => e.EntidadId == id && e.Accion == "Creó el expediente");
    }

    [Fact]
    public async Task Tipo_sin_catalogo_no_genera_checklist_pero_si_crea_el_caso()
    {
        var casos = new FakeCasoRepository();
        var checklist = new FakeChecklistItemRepository();
        var handler = new CrearCasoCommandHandler(casos, checklist, new FakeAuditoriaRepository(), new FakeCurrentUserAccessor());

        var id = await handler.Handle(new CrearCasoCommand("Cliente Prueba", "Otro", null), CancellationToken.None);

        var items = await checklist.GetByCasoIdAsync(id);
        Assert.Empty(items);
    }
}
