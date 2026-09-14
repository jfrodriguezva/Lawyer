using ECAbogados.Application.Mediation;
using ECAbogados.Application.TramitesSAT.Commands.ActualizarTramiteSAT;
using ECAbogados.Application.TramitesSAT.Commands.CrearTramiteSAT;
using ECAbogados.Application.TramitesSAT.Queries.ListarTramitesSAT;
using ECAbogados.Application.TramitesSAT.Queries.ListarTramitesSATPorCliente;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Seguimiento de trámites SAT por cliente: lo opera el rol Consultor.
// Administrador conserva acceso total como superusuario.
[Authorize(Roles = "Consultor,Administrador")]
[ApiController]
[Route("api/tramites-sat")]
public class TramitesSATController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var tramites = await sender.Send(new ListarTramitesSATQuery());
        return Ok(tramites);
    }

    [HttpGet("cliente/{clienteId:int}")]
    public async Task<IActionResult> ListarPorCliente(int clienteId)
    {
        var tramites = await sender.Send(new ListarTramitesSATPorClienteQuery(clienteId));
        return Ok(tramites);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearTramiteSATCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarTramiteSATRequest request)
    {
        await sender.Send(new ActualizarTramiteSATCommand(id, request.Estatus, request.ResponsableUsuarioId, request.FechaLimite, request.Observaciones));
        return NoContent();
    }
}

public record ActualizarTramiteSATRequest(EstatusTramiteSAT Estatus, int? ResponsableUsuarioId, DateTime? FechaLimite, string? Observaciones);
