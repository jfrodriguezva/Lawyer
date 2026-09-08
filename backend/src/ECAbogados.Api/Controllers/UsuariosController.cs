using System.Security.Claims;
using ECAbogados.Application.Usuarios.Commands.ActualizarUsuario;
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

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarUsuarioRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentRole = User.FindFirstValue(ClaimTypes.Role);
        if (currentUserId == id.ToString() && request.Rol != currentRole)
        {
            return BadRequest(new { message = "No puedes cambiar tu propio rol. Pide a otro Administrador que lo haga." });
        }

        await sender.Send(new ActualizarUsuarioCommand(id, request.Nombre, request.Rol, request.NuevaPassword));
        return NoContent();
    }
}

public record CambiarEstatusUsuarioRequest(bool Activo);

public record ActualizarUsuarioRequest(string Nombre, string Rol, string? NuevaPassword);
