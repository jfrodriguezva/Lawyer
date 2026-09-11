using ECAbogados.Application.Clientes.Commands.CambiarEstatusCliente;
using ECAbogados.Application.Clientes.Commands.CrearCliente;
using ECAbogados.Application.Clientes.Queries.ListarClientes;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Gestión de cuentas de Cliente (portal autenticado): solo el rol Administrador
// da de alta cuentas nuevas, igual que con el personal en UsuariosController.
[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class ClientesController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var clientes = await sender.Send(new ListarClientesQuery());
        return Ok(clientes);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearClienteCommand command)
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
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] CambiarEstatusClienteRequest request)
    {
        await sender.Send(new CambiarEstatusClienteCommand(id, request.Activo));
        return NoContent();
    }
}

public record CambiarEstatusClienteRequest(bool Activo);
