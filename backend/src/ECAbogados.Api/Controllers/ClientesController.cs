using ECAbogados.Application.Clientes.Commands.CambiarEstatusCliente;
using ECAbogados.Application.Clientes.Commands.CrearCliente;
using ECAbogados.Application.Clientes.Commands.InvitarCliente;
using ECAbogados.Application.Clientes.Queries.ListarClientes;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Gestión de cuentas de Cliente (portal autenticado). Dar de alta/editar cuentas
// es exclusivo de Abogado/Administrador; listar clientes también lo puede hacer
// Consultor (necesita elegir un cliente al dar de alta un trámite SAT).
[Authorize(Roles = "Abogado,Consultor,Administrador")]
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

    [Authorize(Roles = "Abogado,Administrador")]
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearClienteCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [Authorize(Roles = "Abogado,Administrador")]
    [HttpPost("invitar")]
    public async Task<IActionResult> Invitar([FromBody] InvitarClienteCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [Authorize(Roles = "Abogado,Administrador")]
    [HttpPatch("{id:int}/estatus")]
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] CambiarEstatusClienteRequest request)
    {
        await sender.Send(new CambiarEstatusClienteCommand(id, request.Activo));
        return NoContent();
    }
}

public record CambiarEstatusClienteRequest(bool Activo);
