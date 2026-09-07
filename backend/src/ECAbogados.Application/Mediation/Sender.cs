using Microsoft.Extensions.DependencyInjection;

namespace ECAbogados.Application.Mediation;

/// <summary>
/// Resuelve el handler correspondiente a cada Command/Query vía el contenedor de DI
/// (registrado manualmente en <see cref="ECAbogados.Application.DependencyInjection"/>)
/// y lo invoca por reflexión. Sin librerías de terceros ni costo de licencia.
/// </summary>
public class Sender(IServiceProvider serviceProvider) : ISender
{
    public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        var handlerType = typeof(IRequestHandler<,>).MakeGenericType(request.GetType(), typeof(TResponse));
        var handler = serviceProvider.GetRequiredService(handlerType);
        var method = handlerType.GetMethod("Handle")!;
        return (Task<TResponse>)method.Invoke(handler, [request, cancellationToken])!;
    }

    public Task Send(IRequest request, CancellationToken cancellationToken = default)
    {
        var handlerType = typeof(IRequestHandler<>).MakeGenericType(request.GetType());
        var handler = serviceProvider.GetRequiredService(handlerType);
        var method = handlerType.GetMethod("Handle")!;
        return (Task)method.Invoke(handler, [request, cancellationToken])!;
    }
}
