using ECAbogados.Application.Documentos.Commands.SubirDocumento;
using ECAbogados.Application.Documentos.Queries.ListarDocumentosPorCaso;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DocumentosController(ISender sender, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("caso/{casoId:int}")]
    public async Task<IActionResult> ListarPorCaso(int casoId)
    {
        var documentos = await sender.Send(new ListarDocumentosPorCasoQuery(casoId));
        return Ok(documentos);
    }

    [HttpPost]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> Subir([FromForm] SubirDocumentoRequest request)
    {
        var casoId = request.CasoId;
        var file = request.File;

        if (file.Length == 0)
        {
            return BadRequest(new { message = "El archivo está vacío." });
        }

        var contentRoot = environment.ContentRootPath;
        var carpetaCaso = Path.Combine(contentRoot, "App_Data", "documentos", casoId.ToString());
        Directory.CreateDirectory(carpetaCaso);

        var nombreUnico = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var rutaCompleta = Path.Combine(carpetaCaso, nombreUnico);

        await using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var rutaRelativa = Path.Combine("App_Data", "documentos", casoId.ToString(), nombreUnico);

        var command = new SubirDocumentoCommand(
            casoId,
            file.FileName,
            file.ContentType,
            file.Length,
            rutaRelativa);

        var id = await sender.Send(command);

        return CreatedAtAction(nameof(ListarPorCaso), new { casoId }, new { id });
    }
}

public class SubirDocumentoRequest
{
    public int CasoId { get; set; }
    public IFormFile File { get; set; } = null!;
}
