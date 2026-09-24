using ECAbogados.Application.Mediation;
using ECAbogados.Application.Servicios.Commands.ActualizarServicio;
using ECAbogados.Application.Servicios.Commands.CambiarActivoServicio;
using ECAbogados.Application.Servicios.Commands.CrearServicio;
using ECAbogados.Application.Servicios.Commands.EliminarServicio;
using ECAbogados.Application.Servicios.Queries.ListarServicios;
using ECAbogados.Application.Servicios.Queries.ListarServiciosActivos;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiciosController(ISender sender) : ControllerBase
{
    // Pública: /servicios, /servicios/[slug], el sitemap y el NavBar la consumen
    // sin sesión.
    [AllowAnonymous]
    [EnableRateLimiting("catalogo-publico")]
    [HttpGet("activos")]
    public async Task<IActionResult> ListarActivos()
    {
        var servicios = await sender.Send(new ListarServiciosActivosQuery());
        return Ok(servicios);
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? moduloId)
    {
        var servicios = await sender.Send(new ListarServiciosQuery(moduloId));
        return Ok(servicios);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearServicioCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarServicioRequest request)
    {
        await sender.Send(new ActualizarServicioCommand(
            id, request.ModuloId, request.Slug, request.Titulo, request.Frase, request.Descripcion,
            request.Tipo, request.Beneficios, request.Proceso, request.Orden));
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpPatch("{id:int}/activo")]
    public async Task<IActionResult> CambiarActivo(int id, [FromBody] CambiarActivoRequest request)
    {
        await sender.Send(new CambiarActivoServicioCommand(id, request.Activo));
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await sender.Send(new EliminarServicioCommand(id));
        return NoContent();
    }
}

public record ActualizarServicioRequest(
    int ModuloId,
    string Slug,
    string Titulo,
    string? Frase,
    string Descripcion,
    string? Tipo,
    List<BeneficioServicio> Beneficios,
    List<PasoProcesoServicio> Proceso,
    int Orden);
