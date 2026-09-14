using ECAbogados.Application.Pagos.Commands.RegistrarPago;
using ECAbogados.Application.Pagos.Queries.ListarPagosPorCaso;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Honorarios: parte de la gestión del caso, por lo que el Abogado responsable
// también los administra (Administrador conserva acceso total como superusuario).
[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/[controller]")]
public class PagosController(ISender sender) : ControllerBase
{
    [HttpGet("caso/{casoId:int}")]
    public async Task<IActionResult> ListarPorCaso(int casoId)
    {
        var pagos = await sender.Send(new ListarPagosPorCasoQuery(casoId));
        return Ok(pagos);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarPagoCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }
}
