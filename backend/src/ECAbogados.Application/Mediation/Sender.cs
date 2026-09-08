using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ECAbogados.Application.Mediation;

/// <summary>
/// Resuelve el handler correspondiente a cada Command/Query vía el contenedor de DI
/// (registrado manualmente en <see cref="ECAbogados.Application.DependencyInjection"/>)
/// y lo invoca por reflexión. Sin librerías de terceros ni costo de licencia.
/// Antes de invocar el handler, ejecuta el <see cref="IValidator{T}"/> del request si
/// existe uno registrado (los validadores ya estaban escritos pero nunca se llamaban).
/// </summary>
public class Sender(IServiceProvider serviceProvider) : ISender
{
    public async Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        await ValidateAsync(request, cancellationToken);

        var handlerType = typeof(IRequestHandler<,>).MakeGenericType(request.GetType(), typeof(TResponse));
        var handler = serviceProvider.GetRequiredService(handlerType);
        var method = handlerType.GetMethod("Handle")!;
        return await (Task<TResponse>)method.Invoke(handler, [request, cancellationToken])!;
    }

    public async Task Send(IRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateAsync(request, cancellationToken);

        var handlerType = typeof(IRequestHandler<>).MakeGenericType(request.GetType());
        var handler = serviceProvider.GetRequiredService(handlerType);
        var method = handlerType.GetMethod("Handle")!;
        await (Task)method.Invoke(handler, [request, cancellationToken])!;
    }

    private async Task ValidateAsync(object request, CancellationToken cancellationToken)
    {
        var validatorType = typeof(IValidator<>).MakeGenericType(request.GetType());
        if (serviceProvider.GetService(validatorType) is not IValidator validator)
        {
            return;
        }

        var context = new ValidationContext<object>(request);
        var result = await validator.ValidateAsync(context, cancellationToken);

        if (!result.IsValid)
        {
            throw new ValidationException(result.Errors);
        }
    }
}
