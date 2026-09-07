using ECAbogados.Application.Casos.Commands.ActualizarCaso;
using ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;
using ECAbogados.Application.Casos.Commands.CrearCaso;
using ECAbogados.Application.Casos.Commands.MarcarChecklistItem;
using ECAbogados.Application.Casos.Queries.ListarCasos;
using ECAbogados.Application.Casos.Queries.ObtenerCasoPorId;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CasosController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var casos = await sender.Send(new ListarCasosQuery());
        return Ok(casos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var caso = await sender.Send(new ObtenerCasoPorIdQuery(id));
        return caso is null ? NotFound() : Ok(caso);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearCasoCommand command)
    {
        var id = await sender.Send(command);
        return CreatedAtAction(nameof(ObtenerPorId), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarCasoRequest request)
    {
        try
        {
            await sender.Send(new ActualizarCasoCommand(id, request.ClienteNombre, request.Tipo, request.Notas));
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id:int}/estatus")]
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] CambiarEstatusCasoRequest request)
    {
        // Cerrar un expediente es una decisión que solo el rol Administrador puede tomar.
        if (request.Estatus == EstatusCaso.Cerrado && !User.IsInRole("Administrador"))
        {
            return Forbid();
        }

        try
        {
            await sender.Send(new CambiarEstatusCasoCommand(id, request.Estatus));
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("checklist/{itemId:int}")]
    public async Task<IActionResult> MarcarChecklistItem(int itemId, [FromBody] MarcarChecklistItemRequest request)
    {
        await sender.Send(new MarcarChecklistItemCommand(itemId, request.Completado));
        return NoContent();
    }
}

public record ActualizarCasoRequest(string ClienteNombre, string Tipo, string? Notas);

public record CambiarEstatusCasoRequest(EstatusCaso Estatus);

public record MarcarChecklistItemRequest(bool Completado);
