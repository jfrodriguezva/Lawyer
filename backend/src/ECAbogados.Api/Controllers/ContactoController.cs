using ECAbogados.Application.Contacto.Commands.CrearMensajeContacto;
using ECAbogados.Application.Contacto.Commands.MarcarMensajeAtendido;
using ECAbogados.Application.Contacto.Queries.ListarMensajesContacto;
using ECAbogados.Application.Contacto.Queries.ListarMensajesContactoPaginado;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactoController(ISender sender) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("public")]
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

    // El `Listar()` de arriba sigue sin paginar: lo usa el dashboard para su KPI.
    [Authorize]
    [HttpGet("pagina")]
    public async Task<IActionResult> ListarPaginado([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var resultado = await sender.Send(new ListarMensajesContactoPaginadoQuery(page, pageSize));
        return Ok(resultado);
    }

    [Authorize]
    [HttpPatch("{id:int}/atendido")]
    public async Task<IActionResult> MarcarAtendido(int id)
    {
        await sender.Send(new MarcarMensajeAtendidoCommand(id));
        return NoContent();
    }
}
