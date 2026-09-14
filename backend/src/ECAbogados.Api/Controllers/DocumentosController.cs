using ECAbogados.Application.Documentos;
using ECAbogados.Application.Documentos.Commands.CambiarEstatusDocumento;
using ECAbogados.Application.Documentos.Commands.SubirDocumento;
using ECAbogados.Application.Documentos.Queries.ListarDocumentosPorCaso;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/[controller]")]
public class DocumentosController(ISender sender, IWebHostEnvironment environment, ICurrentUserAccessor currentUser, IDocumentoRepository documentoRepository) : ControllerBase
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

        if (!TiposPermitidos.EsExtensionPermitida(file.FileName))
        {
            return BadRequest(new { message = $"Tipo de archivo no permitido. Extensiones válidas: {TiposPermitidos.ExtensionesPermitidasTexto}." });
        }

        if (file.Length > TiposPermitidos.TamanoMaximoBytes)
        {
            return BadRequest(new { message = "El archivo excede el tamaño máximo permitido (50 MB)." });
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
            rutaRelativa,
            OrigenDocumento.Staff,
            currentUser.UsuarioId,
            currentUser.Nombre,
            request.Descripcion,
            request.Visibilidad);

        var id = await sender.Send(command);

        return CreatedAtAction(nameof(ListarPorCaso), new { casoId }, new { id });
    }

    [HttpPatch("{id:int}/estatus")]
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] CambiarEstatusDocumentoRequest request)
    {
        await sender.Send(new CambiarEstatusDocumentoCommand(id, request.Estatus, request.ComentarioRevision));
        return NoContent();
    }

    // Descarga controlada: nunca se sirve App_Data como archivos estáticos, todo
    // pasa por este endpoint autenticado para que el rol/caso se validen siempre.
    [HttpGet("{id:int}/descargar")]
    public async Task<IActionResult> Descargar(int id)
    {
        var documento = await documentoRepository.GetByIdAsync(id);
        if (documento is null || documento.SoloRegistro || string.IsNullOrEmpty(documento.RutaAlmacenamiento))
        {
            return NotFound();
        }

        var rutaCompleta = Path.Combine(environment.ContentRootPath, documento.RutaAlmacenamiento);
        if (!System.IO.File.Exists(rutaCompleta))
        {
            return NotFound();
        }

        var stream = new FileStream(rutaCompleta, FileMode.Open, FileAccess.Read);
        return File(stream, documento.TipoContenido, documento.NombreArchivo);
    }
}

public class SubirDocumentoRequest
{
    public int CasoId { get; set; }
    public IFormFile File { get; set; } = null!;
    public string? Descripcion { get; set; }
    public VisibilidadDocumento? Visibilidad { get; set; }
}

public record CambiarEstatusDocumentoRequest(EstatusDocumento Estatus, string? ComentarioRevision);
