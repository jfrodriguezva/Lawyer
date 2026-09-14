using System.Security.Claims;
using ECAbogados.Application.Mediation;
using ECAbogados.Application.Notificaciones.Commands.MarcarNotificacionLeida;
using ECAbogados.Application.Notificaciones.Commands.MarcarTodasNotificacionesLeidas;
using ECAbogados.Application.Notificaciones.Queries.ListarMisNotificaciones;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Centro de notificaciones del staff (cada quien ve solo las suyas, filtradas
// por su propio UsuarioId del token). Explícitamente NO incluye el rol
// Cliente: su NameIdentifier es un ClienteId, no un UsuarioId, y mezclarlos
// aquí filtraría notificaciones de otra persona por coincidencia de Id.
[Authorize(Roles = "Abogado,Consultor,Agente,Administrador")]
[ApiController]
[Route("api/notificaciones")]
public class NotificacionesController(ISender sender) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var notificaciones = await sender.Send(new ListarMisNotificacionesQuery(DestinatarioTipo.Usuario, UsuarioId));
        return Ok(notificaciones);
    }

    [HttpPatch("{id:int}/leida")]
    public async Task<IActionResult> MarcarLeida(int id)
    {
        await sender.Send(new MarcarNotificacionLeidaCommand(id));
        return NoContent();
    }

    [HttpPatch("marcar-todas-leidas")]
    public async Task<IActionResult> MarcarTodasLeidas()
    {
        await sender.Send(new MarcarTodasNotificacionesLeidasCommand(DestinatarioTipo.Usuario, UsuarioId));
        return NoContent();
    }
}
