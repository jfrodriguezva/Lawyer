using ECAbogados.Application.Mediation;
using ECAbogados.Application.Tareas.Commands.CrearTarea;
using ECAbogados.Application.Tareas.Commands.MarcarTareaCompletada;
using ECAbogados.Application.Tareas.Queries.ListarTareasPendientes;
using ECAbogados.Application.Tareas.Queries.ListarTareasPorCaso;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/[controller]")]
public class TareasController(ISender sender) : ControllerBase
{
    [HttpGet("caso/{casoId:int}")]
    public async Task<IActionResult> ListarPorCaso(int casoId)
    {
        var tareas = await sender.Send(new ListarTareasPorCasoQuery(casoId));
        return Ok(tareas);
    }

    // Alimenta el dashboard: tareas pendientes (vencidas y próximas) de todos los casos.
    [HttpGet("pendientes")]
    public async Task<IActionResult> ListarPendientes()
    {
        var tareas = await sender.Send(new ListarTareasPendientesQuery());
        return Ok(tareas);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearTareaCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [HttpPatch("{id:int}/completada")]
    public async Task<IActionResult> MarcarCompletada(int id, [FromBody] MarcarTareaCompletadaRequest request)
    {
        await sender.Send(new MarcarTareaCompletadaCommand(id, request.Completada));
        return NoContent();
    }
}

public record MarcarTareaCompletadaRequest(bool Completada);
