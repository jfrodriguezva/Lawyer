using ECAbogados.Application.Contacto.Commands.CrearMensajeContacto;
using ECAbogados.Application.Contacto.Commands.MarcarMensajeAtendido;
using ECAbogados.Application.Contacto.Queries.ListarMensajesContacto;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactoController(ISender sender) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Enviar([FromBody] CrearMensajeContactoCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var mensajes = await sender.Send(new ListarMensajesContactoQuery());
        return Ok(mensajes);
    }

    [Authorize]
    [HttpPatch("{id:int}/atendido")]
    public async Task<IActionResult> MarcarAtendido(int id)
    {
        await sender.Send(new MarcarMensajeAtendidoCommand(id));
        return NoContent();
    }
}
