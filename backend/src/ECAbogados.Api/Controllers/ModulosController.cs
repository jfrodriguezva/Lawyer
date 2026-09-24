using ECAbogados.Application.Mediation;
using ECAbogados.Application.Modulos.Commands.ActualizarModulo;
using ECAbogados.Application.Modulos.Commands.CambiarActivoModulo;
using ECAbogados.Application.Modulos.Commands.CrearModulo;
using ECAbogados.Application.Modulos.Commands.EliminarModulo;
using ECAbogados.Application.Modulos.Queries.ListarModulos;
using ECAbogados.Application.Modulos.Queries.ListarModulosActivos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModulosController(ISender sender) : ControllerBase
{
    // Pública: el NavBar y las páginas de servicios necesitan saber qué módulos
    // mostrar (y cuáles están "Próximamente") antes de cualquier sesión.
    [AllowAnonymous]
    [EnableRateLimiting("catalogo-publico")]
    [HttpGet("activos")]
    public async Task<IActionResult> ListarActivos()
    {
        var modulos = await sender.Send(new ListarModulosActivosQuery());
        return Ok(modulos);
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var modulos = await sender.Send(new ListarModulosQuery());
        return Ok(modulos);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearModuloCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarModuloRequest request)
    {
        await sender.Send(new ActualizarModuloCommand(id, request.Nombre, request.Slug, request.RolResponsable, request.Orden));
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpPatch("{id:int}/activo")]
    public async Task<IActionResult> CambiarActivo(int id, [FromBody] CambiarActivoRequest request)
    {
        await sender.Send(new CambiarActivoModuloCommand(id, request.Activo));
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await sender.Send(new EliminarModuloCommand(id));
        return NoContent();
    }
}

public record ActualizarModuloRequest(string Nombre, string Slug, string RolResponsable, int Orden);

public record CambiarActivoRequest(bool Activo);
