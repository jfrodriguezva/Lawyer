using ECAbogados.Application.Mediation;
using Microsoft.Extensions.DependencyInjection;

namespace ECAbogados.Application.Tests;

/// <summary>
/// Verifica el mediador propio (reemplazo de MediatR): que el registro manual por
/// escaneo de ensamblado en AddApplication() y la resolución vía reflexión en Sender
/// realmente encuentran e invocan el handler correcto, para las dos formas de
/// solicitud (con respuesta y sin respuesta).
/// </summary>
public class SenderTests
{
    public record Ping(string Mensaje) : IRequest<string>;

    public class PingHandler : IRequestHandler<Ping, string>
    {
        public Task<string> Handle(Ping request, CancellationToken cancellationToken) =>
            Task.FromResult($"pong: {request.Mensaje}");
    }

    public record Marcar(List<string> Log) : IRequest;

    public class MarcarHandler : IRequestHandler<Marcar>
    {
        public Task Handle(Marcar request, CancellationToken cancellationToken)
        {
            request.Log.Add("ejecutado");
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task Resuelve_e_invoca_handler_con_respuesta()
    {
        var services = new ServiceCollection();
        services.AddScoped<ISender, Sender>();
        services.AddTransient<IRequestHandler<Ping, string>, PingHandler>();
        var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var resultado = await sender.Send(new Ping("hola"));

        Assert.Equal("pong: hola", resultado);
    }

    [Fact]
    public async Task Resuelve_e_invoca_handler_sin_respuesta()
    {
        var services = new ServiceCollection();
        services.AddScoped<ISender, Sender>();
        services.AddTransient<IRequestHandler<Marcar>, MarcarHandler>();
        var provider = services.BuildServiceProvider();
        var sender = provider.GetRequiredService<ISender>();

        var log = new List<string>();
        await sender.Send(new Marcar(log));

        Assert.Equal(["ejecutado"], log);
    }

    [Fact]
    public void AddApplication_registra_automaticamente_los_handlers_reales_del_ensamblado()
    {
        var services = new ServiceCollection();
        services.AddApplication();

        // No se resuelve (sus dependencias de Infrastructure no están registradas
        // aquí): solo se verifica que el escaneo por reflexión en DependencyInjection.cs
        // efectivamente dio de alta el handler real del proyecto, sin registrarlo a mano.
        var registrado = services.Any(d =>
            d.ServiceType == typeof(IRequestHandler<Casos.Commands.CrearCaso.CrearCasoCommand, int>));

        Assert.True(registrado);
    }
}
