using ECAbogados.Application.Citas.Commands.CambiarEstatusCita;
using ECAbogados.Application.Citas.Commands.CrearCita;
using ECAbogados.Application.Citas.Queries.ListarCitas;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CitasController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var citas = await sender.Send(new ListarCitasQuery());
        return Ok(citas);
    }

    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearCitaCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [HttpPatch("{id:int}/estatus")]
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] CambiarEstatusCitaRequest request)
    {
        try
        {
            await sender.Send(new CambiarEstatusCitaCommand(id, request.Estatus));
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}

public record CambiarEstatusCitaRequest(EstatusCita Estatus);
