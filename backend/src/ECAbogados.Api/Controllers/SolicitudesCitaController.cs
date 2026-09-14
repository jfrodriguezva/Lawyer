using ECAbogados.Application.Citas.SolicitudesCita.Commands.CrearSolicitudCita;
using ECAbogados.Application.Citas.SolicitudesCita.Commands.ResponderHorarioAlternativo;
using ECAbogados.Application.Citas.SolicitudesCita.Commands.RevisarSolicitudCita;
using ECAbogados.Application.Citas.SolicitudesCita.Queries.ListarSolicitudesCita;
using ECAbogados.Application.Citas.SolicitudesCita.Queries.ObtenerSolicitudPorId;
using ECAbogados.Application.Citas.SolicitudesCita.Queries.ObtenerSolicitudPorToken;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

/// <summary>
/// Negociación de citas: un visitante/cliente propone fecha y hora, el
/// despacho acepta/reprograma/rechaza/pide información, y el solicitante
/// responde a una propuesta alternativa mediante su enlace público (TokenPublico).
/// Abogado atiende el módulo Abogado, Consultor el módulo SAT; Administrador ve ambos.
/// </summary>
[ApiController]
[Route("api/solicitudes-cita")]
public class SolicitudesCitaController(ISender sender) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearSolicitudCitaCommand command)
    {
        var resultado = await sender.Send(command);
        return Created(string.Empty, resultado);
    }

    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpGet("{token}")]
    public async Task<IActionResult> ObtenerPorToken(string token)
    {
        var solicitud = await sender.Send(new ObtenerSolicitudPorTokenQuery(token));
        return solicitud is null ? NotFound() : Ok(solicitud);
    }

    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpPatch("{token}/responder")]
    public async Task<IActionResult> Responder(string token, [FromBody] ResponderHorarioAlternativoRequest request)
    {
        await sender.Send(new ResponderHorarioAlternativoCommand(token, request.Respuesta, request.NuevaFechaHoraPropuesta));
        return NoContent();
    }

    [Authorize(Roles = "Abogado,Consultor,Administrador")]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var solicitudes = await sender.Send(new ListarSolicitudesCitaQuery(ModuloPermitidoParaRolActual()));
        return Ok(solicitudes);
    }

    [Authorize(Roles = "Abogado,Consultor,Administrador")]
    [HttpPatch("{id:int}/revisar")]
    public async Task<IActionResult> Revisar(int id, [FromBody] RevisarSolicitudRequest request)
    {
        // Un Abogado nunca debe poder resolver una solicitud del módulo SAT y
        // viceversa con un Consultor: se valida el módulo antes de ejecutar la acción.
        var moduloPermitido = ModuloPermitidoParaRolActual();
        if (moduloPermitido is not null)
        {
            var solicitud = await sender.Send(new ObtenerSolicitudPorIdQuery(id));
            if (solicitud is null)
            {
                return NotFound();
            }
            if (solicitud.Modulo != moduloPermitido)
            {
                return Forbid();
            }
        }

        await sender.Send(new RevisarSolicitudCitaCommand(id, request.Accion, request.NuevaFechaHora, request.Motivo));
        return NoContent();
    }

    // Administrador ve ambos módulos sin filtro; Abogado solo "Abogado"; Consultor solo "SAT".
    private ModuloSolicitud? ModuloPermitidoParaRolActual()
    {
        if (User.IsInRole("Administrador")) return null;
        if (User.IsInRole("Consultor")) return ModuloSolicitud.SAT;
        return ModuloSolicitud.Abogado;
    }
}

public record ResponderHorarioAlternativoRequest(RespuestaSolicitante Respuesta, DateTime? NuevaFechaHoraPropuesta);

public record RevisarSolicitudRequest(AccionRevisionSolicitud Accion, DateTime? NuevaFechaHora, string? Motivo);
