using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ECAbogados.Application;

/// <summary>Marker used to locate this assembly for MediatR/FluentValidation registration.</summary>
public sealed class ApplicationAssemblyMarker;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<ApplicationAssemblyMarker>());
        services.AddValidatorsFromAssemblyContaining<ApplicationAssemblyMarker>();

        return services;
    }
}
