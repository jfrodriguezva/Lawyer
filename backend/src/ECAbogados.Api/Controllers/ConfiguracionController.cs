using ECAbogados.Application.Configuracion.Commands.ActualizarFlag;
using ECAbogados.Application.Configuracion.Queries.ObtenerFlags;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[ApiController]
[Route("api/configuracion")]
public class ConfiguracionController(ISender sender) : ControllerBase
{
    // Pública: el sitio necesita saber si mostrar "Trámite SAT" en el
    // formulario de citas antes de que exista cualquier sesión.
    [AllowAnonymous]
    [HttpGet("flags")]
    public async Task<IActionResult> ObtenerFlags()
    {
        var flags = await sender.Send(new ObtenerFlagsQuery());
        return Ok(flags);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPatch("flags/{clave}")]
    public async Task<IActionResult> ActualizarFlag(string clave, [FromBody] ActualizarFlagRequest request)
    {
        await sender.Send(new ActualizarFlagCommand(clave, request.Valor));
        return NoContent();
    }
}

public record ActualizarFlagRequest(bool Valor);
