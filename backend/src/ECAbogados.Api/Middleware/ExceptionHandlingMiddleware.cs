using ECAbogados.Application.Common.Exceptions;
using FluentValidation;

namespace ECAbogados.Api.Middleware;

/// <summary>
/// Único punto donde se traducen las excepciones de dominio/aplicación a
/// respuestas HTTP. Reemplaza los try/catch repetidos que antes vivían en
/// cada controlador. Nunca expone stack traces ni detalles internos al
/// cliente: los errores no previstos solo se registran en el log.
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            var errors = ex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "One or more validation errors occurred.", new { errors });
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning("Acceso no autorizado en {Path}: {Mensaje}", context.Request.Path, ex.Message);
            await WriteProblemAsync(context, StatusCodes.Status401Unauthorized, ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (ConflictException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status409Conflict, ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado en {Metodo} {Path}", context.Request.Method, context.Request.Path);
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError,
                "Ocurrió un error inesperado. Intenta de nuevo más tarde.");
        }
    }

    private static Task WriteProblemAsync(HttpContext context, int statusCode, string message, object? extra = null)
    {
        if (context.Response.HasStarted)
        {
            return Task.CompletedTask;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        object body = extra is null
            ? new { message }
            : new { message, extra };

        return context.Response.WriteAsJsonAsync(body);
    }
}
