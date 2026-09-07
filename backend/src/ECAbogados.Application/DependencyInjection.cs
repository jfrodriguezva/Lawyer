using System.Reflection;
using ECAbogados.Application.Mediation;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ECAbogados.Application;

/// <summary>Marker used to locate this assembly for handler/FluentValidation registration.</summary>
public sealed class ApplicationAssemblyMarker;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ISender, Sender>();
        RegisterRequestHandlers(services, typeof(ApplicationAssemblyMarker).Assembly);
        services.AddValidatorsFromAssemblyContaining<ApplicationAssemblyMarker>();

        return services;
    }

    // Registro manual (sin librerías de terceros): escanea este ensamblado y da de
    // alta cada Command/Query handler contra su interfaz IRequestHandler<> propia.
    private static void RegisterRequestHandlers(IServiceCollection services, Assembly assembly)
    {
        var openHandlerTypes = new[] { typeof(IRequestHandler<>), typeof(IRequestHandler<,>) };

        var registros = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .SelectMany(t => t.GetInterfaces()
                .Where(i => i.IsGenericType && openHandlerTypes.Contains(i.GetGenericTypeDefinition()))
                .Select(i => (Interface: i, Implementation: t)));

        foreach (var (interfaceType, implementationType) in registros)
        {
            services.AddTransient(interfaceType, implementationType);
        }
    }
}
