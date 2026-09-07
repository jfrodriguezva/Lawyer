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
}
