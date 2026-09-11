using ECAbogados.Application.Plazos.Commands.CrearPlazo;
using ECAbogados.Application.Plazos.Commands.MarcarPlazoCumplido;
using ECAbogados.Application.Plazos.Queries.ListarPlazosPorCaso;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize(Roles = "Administrador,Asistente")]
[ApiController]
[Route("api/[controller]")]
public class PlazosController(ISender sender) : ControllerBase
{
    [HttpGet("caso/{casoId:int}")]
    public async Task<IActionResult> ListarPorCaso(int casoId)
    {
        var plazos = await sender.Send(new ListarPlazosPorCasoQuery(casoId));
        return Ok(plazos);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearPlazoCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [HttpPatch("{id:int}/cumplido")]
    public async Task<IActionResult> MarcarCumplido(int id, [FromBody] MarcarPlazoCumplidoRequest request)
    {
        await sender.Send(new MarcarPlazoCumplidoCommand(id, request.Cumplido));
        return NoContent();
    }
}

public record MarcarPlazoCumplidoRequest(bool Cumplido);
