using System.Security.Claims;
using ECAbogados.Application.Usuarios.Commands.CambiarEstatusUsuario;
using ECAbogados.Application.Usuarios.Commands.CrearUsuario;
using ECAbogados.Application.Usuarios.Queries.ListarUsuarios;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Gestión de personal: solo el rol Administrador da de alta cuentas nuevas.
[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class UsuariosController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var usuarios = await sender.Send(new ListarUsuariosQuery());
        return Ok(usuarios);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearUsuarioCommand command)
    {
        try
        {
            var id = await sender.Send(command);
            return Created(string.Empty, new { id });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/estatus")]
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] CambiarEstatusUsuarioRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!request.Activo && currentUserId == id.ToString())
        {
            return BadRequest(new { message = "No puedes desactivar tu propia cuenta." });
        }

        await sender.Send(new CambiarEstatusUsuarioCommand(id, request.Activo));
        return NoContent();
    }
}

public record CambiarEstatusUsuarioRequest(bool Activo);
