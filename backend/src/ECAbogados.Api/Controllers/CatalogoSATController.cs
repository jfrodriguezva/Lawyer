using ECAbogados.Application.CatalogoSAT.Commands.ActualizarTramiteCatalogo;
using ECAbogados.Application.CatalogoSAT.Commands.CambiarEstatusTramiteCatalogo;
using ECAbogados.Application.CatalogoSAT.Commands.CrearTramiteCatalogo;
using ECAbogados.Application.CatalogoSAT.Queries.ListarCatalogoSAT;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Catálogo de trámites SAT: es configuración del despacho (qué trámites existen,
// qué requisitos piden), por lo que solo Administrador lo edita. Consultor solo
// puede leerlo, para elegir un trámite del catálogo al dar de alta uno nuevo.
// Sin [Authorize] a nivel de clase: varios [Authorize] combinados exigirían TODOS
// los roles a la vez (AND, no OR), así que cada acción declara su propio rol.
[ApiController]
[Route("api/catalogo-sat")]
public class CatalogoSATController(ISender sender) : ControllerBase
{
    [Authorize(Roles = "Consultor,Administrador")]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var catalogo = await sender.Send(new ListarCatalogoSATQuery());
        return Ok(catalogo);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearTramiteCatalogoCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarTramiteCatalogoRequest request)
    {
        await sender.Send(new ActualizarTramiteCatalogoCommand(id, request.Nombre, request.Requisitos, request.Etapas, request.Observaciones));
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpPatch("{id:int}/estatus")]
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] CambiarEstatusTramiteCatalogoRequest request)
    {
        await sender.Send(new CambiarEstatusTramiteCatalogoCommand(id, request.Activo));
        return NoContent();
    }
}

public record ActualizarTramiteCatalogoRequest(string Nombre, string? Requisitos, string? Etapas, string? Observaciones);

public record CambiarEstatusTramiteCatalogoRequest(bool Activo);
