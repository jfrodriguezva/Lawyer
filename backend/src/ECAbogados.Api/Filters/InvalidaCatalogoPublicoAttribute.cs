using ECAbogados.Api.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;

namespace ECAbogados.Api.Filters;

// Se aplica a los controllers que editan Módulos/Servicios/Promociones: tras
// cualquier escritura (POST/PUT/PATCH/DELETE) que termine sin excepción, tira el
// cache en memoria de /api/catalogo-publico para que el cambio del admin se vea
// en el siguiente request en vez de esperar a que venza el TTL.
[AttributeUsage(AttributeTargets.Class)]
public sealed class InvalidaCatalogoPublicoAttribute : ActionFilterAttribute
{
    public override void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.Exception is not null || HttpMethods.IsGet(context.HttpContext.Request.Method))
        {
            return;
        }

        context.HttpContext.RequestServices
            .GetRequiredService<IMemoryCache>()
            .Remove(CatalogoPublicoController.CacheKey);
    }
}
