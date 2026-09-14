using ECAbogados.Application.Auditoria.Queries.ListarAuditoriaGlobal;
using ECAbogados.Application.Auditoria.Queries.ListarAuditoriaPorCaso;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// El historial revela qué miembro del staff hizo cada cambio: es información
// sensible del equipo, por eso queda restringida a Administrador.
[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class AuditoriaController(ISender sender) : ControllerBase
{
    [HttpGet("caso/{casoId:int}")]
    public async Task<IActionResult> ListarPorCaso(int casoId)
    {
        var entradas = await sender.Send(new ListarAuditoriaPorCasoQuery(casoId));
        return Ok(entradas);
    }

    [HttpGet]
    public async Task<IActionResult> ListarGlobal([FromQuery] int page = 1, [FromQuery] int pageSize = 30, [FromQuery] string? entidad = null)
    {
        var resultado = await sender.Send(new ListarAuditoriaGlobalQuery(page, pageSize, entidad));
        return Ok(resultado);
    }
}
