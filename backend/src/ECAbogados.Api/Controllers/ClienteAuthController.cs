using System.Security.Claims;
using ECAbogados.Application.Auth.Commands.AceptarInvitacionCliente;
using ECAbogados.Application.Auth.Commands.LoginCliente;
using ECAbogados.Application.Casos.Queries.ListarCasosPorCliente;
using ECAbogados.Application.Documentos;
using ECAbogados.Application.Documentos.Commands.SubirDocumento;
using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Application.TramitesSAT.Queries.ListarTramitesSATPorCliente;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

// Autenticación y portal del Cliente (cuenta real, distinta del staff en AuthController
// y del enlace mágico anónimo de PortalController).
[ApiController]
[Route("api/cliente")]
public class ClienteAuthController(ISender sender, ICasoRepository casoRepository, IWebHostEnvironment environment) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginClienteRequest request)
    {
        var result = await sender.Send(new LoginClienteCommand(request.Email, request.Password));
        return Ok(result);
    }

    // El Abogado/Administrador crea la cuenta sin contraseña y envía este enlace
    // (ver InvitarClienteCommand); el cliente lo usa una sola vez para activarse.
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpPost("aceptar-invitacion")]
    public async Task<IActionResult> AceptarInvitacion([FromBody] AceptarInvitacionRequest request)
    {
        await sender.Send(new AceptarInvitacionClienteCommand(request.Token, request.NuevaPassword));
        return NoContent();
    }

    [Authorize(Roles = "Cliente")]
    [HttpGet("mis-casos")]
    public async Task<IActionResult> MisCasos()
    {
        var clienteId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var casos = await sender.Send(new ListarCasosPorClienteQuery(clienteId));
        return Ok(casos);
    }

    // Informativo únicamente: seguimiento del trámite, nunca contraseñas/e.firma.
    [Authorize(Roles = "Cliente")]
    [HttpGet("mis-tramites-sat")]
    public async Task<IActionResult> MisTramitesSAT()
    {
        var clienteId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tramites = await sender.Send(new ListarTramitesSATPorClienteQuery(clienteId));
        return Ok(tramites);
    }

    // El cliente sube documentos únicamente a sus propios casos: se valida que
    // el caso pertenezca al ClienteId del token antes de aceptar el archivo.
    [Authorize(Roles = "Cliente")]
    [HttpPost("casos/{casoId:int}/documentos")]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> SubirDocumento(int casoId, [FromForm] SubirDocumentoClienteRequest request)
    {
        var clienteId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var nombreCliente = User.FindFirstValue(ClaimTypes.Name);

        var caso = await casoRepository.GetByIdAsync(casoId);
        if (caso is null || caso.ClienteId != clienteId)
        {
            return NotFound();
        }

        var file = request.File;
        if (file.Length == 0)
        {
            return BadRequest(new { message = "El archivo está vacío." });
        }

        if (!TiposPermitidos.EsExtensionPermitida(file.FileName))
        {
            return BadRequest(new { message = $"Tipo de archivo no permitido. Extensiones válidas: {TiposPermitidos.ExtensionesPermitidasTexto}." });
        }

        if (file.Length > TiposPermitidos.TamanoMaximoBytes)
        {
            return BadRequest(new { message = "El archivo excede el tamaño máximo permitido (50 MB)." });
        }

        var carpetaCaso = Path.Combine(environment.ContentRootPath, "App_Data", "documentos", casoId.ToString());
        Directory.CreateDirectory(carpetaCaso);

        var nombreUnico = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var rutaCompleta = Path.Combine(carpetaCaso, nombreUnico);

        await using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var rutaRelativa = Path.Combine("App_Data", "documentos", casoId.ToString(), nombreUnico);

        var id = await sender.Send(new SubirDocumentoCommand(
            casoId, file.FileName, file.ContentType, file.Length, rutaRelativa,
            OrigenDocumento.Cliente, clienteId, nombreCliente));

        return Created(string.Empty, new { id });
    }
}

public record LoginClienteRequest(string Email, string Password);

public record AceptarInvitacionRequest(string Token, string NuevaPassword);

public class SubirDocumentoClienteRequest
{
    public IFormFile File { get; set; } = null!;
}
