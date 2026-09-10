using ECAbogados.Application.Auth.Commands.SolicitarResetPassword;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class SolicitarResetPasswordCommandHandlerTests
{
    private static (SolicitarResetPasswordCommandHandler Handler, FakeUsuarioRepository Usuarios, FakePasswordResetNotifier Notifier) CrearHandler()
    {
        var usuarios = new FakeUsuarioRepository();
        var notifier = new FakePasswordResetNotifier();
        var handler = new SolicitarResetPasswordCommandHandler(usuarios, notifier);
        return (handler, usuarios, notifier);
    }

    [Fact]
    public async Task Correo_existente_y_activo_genera_token_y_envia_enlace()
    {
        var (handler, usuarios, notifier) = CrearHandler();
        usuarios.Seed(new Usuario { Email = "erika@ecabogados.mx", PasswordHash = "hashed:x", Nombre = "Erika", Rol = "Administrador", Activo = true });

        await handler.Handle(new SolicitarResetPasswordCommand("erika@ecabogados.mx"), CancellationToken.None);

        Assert.Single(notifier.Enviados);
        Assert.Equal("erika@ecabogados.mx", notifier.Enviados[0].Email);

        var usuario = await usuarios.GetByEmailAsync("erika@ecabogados.mx");
        Assert.NotNull(usuario!.ResetToken);
        Assert.NotNull(usuario.ResetTokenExpira);
    }

    [Fact]
    public async Task Correo_inexistente_no_lanza_y_no_envia_nada()
    {
        var (handler, _, notifier) = CrearHandler();

        await handler.Handle(new SolicitarResetPasswordCommand("no-existe@ecabogados.mx"), CancellationToken.None);

        Assert.Empty(notifier.Enviados);
    }

    [Fact]
    public async Task Usuario_inactivo_no_recibe_enlace()
    {
        var (handler, usuarios, notifier) = CrearHandler();
        usuarios.Seed(new Usuario { Email = "inactivo@ecabogados.mx", PasswordHash = "hashed:x", Nombre = "Inactivo", Rol = "Asistente", Activo = false });

        await handler.Handle(new SolicitarResetPasswordCommand("inactivo@ecabogados.mx"), CancellationToken.None);

        Assert.Empty(notifier.Enviados);
    }
}
