using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Application.Promociones;
using ECAbogados.Application.Promociones.Commands.ActualizarPromocion;
using ECAbogados.Application.Promociones.Commands.CambiarActivoPromocion;
using ECAbogados.Application.Promociones.Commands.CrearPromocion;
using ECAbogados.Application.Promociones.Commands.EliminarPromocion;
using ECAbogados.Application.Promociones.Queries.ListarPromociones;
using ECAbogados.Application.Promociones.Queries.ListarPromocionesActivas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromocionesController(ISender sender, IWebHostEnvironment environment, IPromocionRepository promocionRepository) : ControllerBase
{
    // Pública: el banner del servicio y el aviso del NavBar la consumen sin sesión.
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpGet("activas")]
    public async Task<IActionResult> ListarActivas()
    {
        var promociones = await sender.Send(new ListarPromocionesActivasQuery());
        return Ok(promociones);
    }

    // Pública: la imagen es contenido de mercadeo, no un documento sensible.
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpGet("{id:int}/imagen")]
    public async Task<IActionResult> Imagen(int id)
    {
        var promocion = await promocionRepository.GetByIdAsync(id);
        if (promocion is null)
        {
            return NotFound();
        }

        var rutaCompleta = Path.Combine(environment.ContentRootPath, promocion.RutaAlmacenamiento);
        if (!System.IO.File.Exists(rutaCompleta))
        {
            return NotFound();
        }

        var stream = new FileStream(rutaCompleta, FileMode.Open, FileAccess.Read);
        return File(stream, promocion.TipoContenido, promocion.NombreArchivo);
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var promociones = await sender.Send(new ListarPromocionesQuery());
        return Ok(promociones);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPost]
    [RequestSizeLimit(6_000_000)]
    public async Task<IActionResult> Crear([FromForm] SubirPromocionRequest request)
    {
        var file = request.Imagen;

        if (file.Length == 0)
        {
            return BadRequest(new { message = "La imagen está vacía." });
        }

        if (!ImagenesPermitidas.EsExtensionPermitida(file.FileName))
        {
            return BadRequest(new { message = $"Tipo de archivo no permitido. Extensiones válidas: {ImagenesPermitidas.ExtensionesPermitidasTexto}." });
        }

        if (file.Length > ImagenesPermitidas.TamanoMaximoBytes)
        {
            return BadRequest(new { message = "La imagen excede el tamaño máximo permitido (5 MB)." });
        }

        var rutaRelativa = await GuardarImagenAsync(file);

        var command = new CrearPromocionCommand(request.Texto, file.FileName, file.ContentType, rutaRelativa, request.Servicios.ToList());
        var id = await sender.Send(command);

        return Created(string.Empty, new { id });
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    [RequestSizeLimit(6_000_000)]
    public async Task<IActionResult> Actualizar(int id, [FromForm] ActualizarPromocionRequest request)
    {
        string? rutaRelativa = null;
        string? nombreArchivo = null;
        string? tipoContenido = null;

        if (request.Imagen is not null && request.Imagen.Length > 0)
        {
            if (!ImagenesPermitidas.EsExtensionPermitida(request.Imagen.FileName))
            {
                return BadRequest(new { message = $"Tipo de archivo no permitido. Extensiones válidas: {ImagenesPermitidas.ExtensionesPermitidasTexto}." });
            }

            if (request.Imagen.Length > ImagenesPermitidas.TamanoMaximoBytes)
            {
                return BadRequest(new { message = "La imagen excede el tamaño máximo permitido (5 MB)." });
            }

            rutaRelativa = await GuardarImagenAsync(request.Imagen);
            nombreArchivo = request.Imagen.FileName;
            tipoContenido = request.Imagen.ContentType;
        }

        await sender.Send(new ActualizarPromocionCommand(id, request.Texto, nombreArchivo, tipoContenido, rutaRelativa, request.Servicios.ToList()));
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpPatch("{id:int}/activo")]
    public async Task<IActionResult> CambiarActivo(int id, [FromBody] CambiarActivoRequest request)
    {
        await sender.Send(new CambiarActivoPromocionCommand(id, request.Activo));
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var promocion = await promocionRepository.GetByIdAsync(id);
        await sender.Send(new EliminarPromocionCommand(id));

        if (promocion is not null)
        {
            var rutaCompleta = Path.Combine(environment.ContentRootPath, promocion.RutaAlmacenamiento);
            if (System.IO.File.Exists(rutaCompleta))
            {
                System.IO.File.Delete(rutaCompleta);
            }
        }

        return NoContent();
    }

    private async Task<string> GuardarImagenAsync(IFormFile file)
    {
        var carpeta = Path.Combine(environment.ContentRootPath, "App_Data", "promociones");
        Directory.CreateDirectory(carpeta);

        var nombreUnico = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var rutaCompleta = Path.Combine(carpeta, nombreUnico);

        await using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Path.Combine("App_Data", "promociones", nombreUnico);
    }
}

public class SubirPromocionRequest
{
    public string Texto { get; set; } = string.Empty;
    public IFormFile Imagen { get; set; } = null!;
    public int[] Servicios { get; set; } = [];
}

public class ActualizarPromocionRequest
{
    public string Texto { get; set; } = string.Empty;
    public IFormFile? Imagen { get; set; }
    public int[] Servicios { get; set; } = [];
}
