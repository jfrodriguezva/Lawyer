using ECAbogados.Application.Mediation;
using ECAbogados.Application.Plantillas.Commands.ActualizarPlantilla;
using ECAbogados.Application.Plantillas.Commands.CrearPlantilla;
using ECAbogados.Application.Plantillas.Commands.EliminarPlantilla;
using ECAbogados.Application.Plantillas.Queries.ListarPlantillas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/[controller]")]
public class PlantillasController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var plantillas = await sender.Send(new ListarPlantillasQuery());
        return Ok(plantillas);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearPlantillaCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarPlantillaRequest request)
    {
        await sender.Send(new ActualizarPlantillaCommand(id, request.Nombre, request.Contenido));
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await sender.Send(new EliminarPlantillaCommand(id));
        return NoContent();
    }
}

public record ActualizarPlantillaRequest(string Nombre, string Contenido);
