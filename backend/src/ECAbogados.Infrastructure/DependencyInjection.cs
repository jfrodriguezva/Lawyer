using ECAbogados.Application.Interfaces;
using ECAbogados.Infrastructure.Notifications;
using ECAbogados.Infrastructure.Persistence;
using ECAbogados.Infrastructure.Persistence.Repositories;
using ECAbogados.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ECAbogados.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<SqlConnectionFactory>();

        services.AddScoped<ICasoRepository, CasoRepository>();
        services.AddScoped<ICitaRepository, CitaRepository>();
        services.AddScoped<IDocumentoRepository, DocumentoRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IMensajeContactoRepository, MensajeContactoRepository>();
        services.AddScoped<IChecklistItemRepository, ChecklistItemRepository>();
        services.AddScoped<IPlazoRepository, PlazoRepository>();
        services.AddScoped<IPagoRepository, PagoRepository>();

        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();

        services.AddSingleton<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IStaffNotifier, StaffNotifier>();
        services.AddHostedService<RecordatorioBackgroundService>();

        return services;
    }
}
