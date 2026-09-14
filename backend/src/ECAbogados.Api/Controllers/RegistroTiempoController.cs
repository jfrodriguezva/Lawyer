using ECAbogados.Application.Mediation;
using ECAbogados.Application.RegistrosTiempo.Commands.RegistrarTiempo;
using ECAbogados.Application.RegistrosTiempo.Queries.ListarTiempoPorCaso;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/registros-tiempo")]
public class RegistroTiempoController(ISender sender) : ControllerBase
{
    [HttpGet("caso/{casoId:int}")]
    public async Task<IActionResult> ListarPorCaso(int casoId)
    {
        var registros = await sender.Send(new ListarTiempoPorCasoQuery(casoId));
        return Ok(registros);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarTiempoCommand command)
    {
        var id = await sender.Send(command);
        return Created(string.Empty, new { id });
    }
}
