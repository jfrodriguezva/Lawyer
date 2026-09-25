using ECAbogados.Application.Catalogo.Queries.ListarCatalogoPublico;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;

namespace ECAbogados.Api.Controllers;

// Une /modulos/activos + /servicios/activos + /promociones/activas en una sola
// respuesta: GuestHeader y LandingExperience pedían los tres por separado y por
// duplicado (6 peticiones en una sola carga de la home) -- ver el incidente
// documentado en Program.cs, política "catalogo-publico".
[ApiController]
[Route("api/catalogo-publico")]
public class CatalogoPublicoController(ISender sender, IMemoryCache cache) : ControllerBase
{
    private const string CacheKey = "catalogo-publico";
    private static readonly TimeSpan Ttl = TimeSpan.FromSeconds(30);

    [AllowAnonymous]
    [EnableRateLimiting("catalogo-publico")]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        // Cache en memoria del proceso (barato: catálogo de decenas de filas) +
        // Cache-Control para que el propio navegador ni siquiera repita la
        // petición durante la ventana -- 30s es lo mismo que ya usaba el fetch de
        // promociones en Next.js, un margen que un admin ya toleraba antes de
        // que esto se moviera al backend.
        if (!cache.TryGetValue(CacheKey, out CatalogoPublicoDto? catalogo))
        {
            catalogo = await sender.Send(new ListarCatalogoPublicoQuery());
            cache.Set(CacheKey, catalogo, Ttl);
        }

        Response.Headers.CacheControl = "public, max-age=30";
        return Ok(catalogo);
    }
}
