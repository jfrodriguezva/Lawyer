using ECAbogados.Application.Dashboard.Queries.ObtenerResumenPanel;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Panel jurídico (Abogado y Administrador). Los conteos de casos siguen en
// /api/casos/resumen; aquí va el resto de lo que muestra el dashboard.
[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController(ISender sender) : ControllerBase
{
    [HttpGet("resumen")]
    public async Task<IActionResult> ObtenerResumen()
    {
        // Mismo criterio que SolicitudesCitaController: Administrador ve ambos
        // módulos, Abogado solo las solicitudes del módulo "Abogado".
        ModuloSolicitud? modulo = User.IsInRole("Administrador") ? null : ModuloSolicitud.Abogado;
        var resumen = await sender.Send(new ObtenerResumenPanelQuery(modulo));
        return Ok(resumen);
    }
}
