using ECAbogados.Application.Mediation;
using ECAbogados.Application.Reportes.Queries.ReporteCasos;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/[controller]")]
public class ReportesController(ISender sender) : ControllerBase
{
    [HttpGet("casos")]
    public async Task<IActionResult> ReporteCasos(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] int? abogadoResponsableId,
        [FromQuery] string? tipo,
        [FromQuery] EstatusCaso? estatus)
    {
        var reporte = await sender.Send(new ReporteCasosQuery(desde, hasta, abogadoResponsableId, tipo, estatus));
        return Ok(reporte);
    }
}
