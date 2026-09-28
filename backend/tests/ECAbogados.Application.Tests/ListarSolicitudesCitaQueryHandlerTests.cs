using ECAbogados.Application.Citas.SolicitudesCita.Queries.ListarSolicitudesCita;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class ListarSolicitudesCitaQueryHandlerTests
{
    [Fact]
    public async Task Carga_el_historial_de_todas_las_solicitudes_en_una_sola_consulta()
    {
        var repo = new FakeSolicitudCitaRepository();
        var conHistorial = await repo.CreateAsync(new SolicitudCita { NombreSolicitante = "Con historial", Modulo = ModuloSolicitud.Abogado });
        await repo.CreateAsync(new SolicitudCita { NombreSolicitante = "Sin historial", Modulo = ModuloSolicitud.Abogado });
        await repo.CreateAsync(new SolicitudCita { NombreSolicitante = "SAT", Modulo = ModuloSolicitud.SAT });
        await repo.AgregarHistorialAsync(new HistorialCitaCambio { SolicitudCitaId = conHistorial, PropuestoPor = OrigenCambioCita.Staff, Fecha = DateTime.UtcNow });
        await repo.AgregarHistorialAsync(new HistorialCitaCambio { SolicitudCitaId = conHistorial, PropuestoPor = OrigenCambioCita.Staff, Fecha = DateTime.UtcNow.AddMinutes(1) });

        var resultado = await new ListarSolicitudesCitaQueryHandler(repo)
            .Handle(new ListarSolicitudesCitaQuery(ModuloSolicitud.Abogado), CancellationToken.None);

        Assert.Equal(2, resultado.Count);
        Assert.Equal(2, resultado.Single(s => s.NombreSolicitante == "Con historial").Historial.Count);
        Assert.Empty(resultado.Single(s => s.NombreSolicitante == "Sin historial").Historial);
        Assert.Equal(1, repo.LlamadasHistorialPorLote);
    }
}
