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
}
