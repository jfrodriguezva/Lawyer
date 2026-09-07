using ECAbogados.Application.Casos.Queries.ObtenerCasoPorToken;
using ECAbogados.Application.Documentos.Commands.SubirDocumento;
using ECAbogados.Application.Documentos.Queries.ListarDocumentosPorCaso;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

/// <summary>
/// Portal del cliente: acceso público mediante un enlace mágico (token único por
/// caso), sin registro ni contraseña. El staff comparte el link por WhatsApp/correo.
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class PortalController(ISender sender, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("{token}")]
    public async Task<IActionResult> ObtenerCaso(string token)
    {
        var caso = await sender.Send(new ObtenerCasoPorTokenQuery(token));
        return caso is null ? NotFound() : Ok(caso);
    }

    [HttpPost("{token}/documentos")]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> SubirDocumento(string token, [FromForm] SubirDocumentoPortalRequest request)
    {
        var caso = await sender.Send(new ObtenerCasoPorTokenQuery(token));
        if (caso is null)
        {
            return NotFound();
        }

        var file = request.File;
        if (file.Length == 0)
        {
            return BadRequest(new { message = "El archivo está vacío." });
        }

        var contentRoot = environment.ContentRootPath;
        var carpetaCaso = Path.Combine(contentRoot, "App_Data", "documentos", caso.Id.ToString());
        Directory.CreateDirectory(carpetaCaso);

        var nombreUnico = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var rutaCompleta = Path.Combine(carpetaCaso, nombreUnico);

        await using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var rutaRelativa = Path.Combine("App_Data", "documentos", caso.Id.ToString(), nombreUnico);

        var id = await sender.Send(new SubirDocumentoCommand(
            caso.Id,
            file.FileName,
            file.ContentType,
            file.Length,
            rutaRelativa));

        return Created(string.Empty, new { id });
    }
}

public class SubirDocumentoPortalRequest
{
    public IFormFile File { get; set; } = null!;
}
