using ECAbogados.Application.Auth.Commands.RestablecerPassword;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class RestablecerPasswordCommandHandlerTests
{
    private static (RestablecerPasswordCommandHandler Handler, FakeUsuarioRepository Usuarios) CrearHandler()
    {
        var usuarios = new FakeUsuarioRepository();
        var handler = new RestablecerPasswordCommandHandler(usuarios, new FakePasswordHasher());
        return (handler, usuarios);
    }

    [Fact]
    public async Task Token_invalido_lanza_InvalidOperationException()
    {
        var (handler, _) = CrearHandler();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new RestablecerPasswordCommand("no-existe", "NuevaPass123!"), CancellationToken.None));
    }

    [Fact]
    public async Task Token_expirado_lanza_InvalidOperationException()
    {
        var (handler, usuarios) = CrearHandler();
        usuarios.Seed(new Usuario
        {
            Email = "erika@ecabogados.mx",
            PasswordHash = "hashed:vieja",
            Nombre = "Erika",
            Rol = "Administrador",
            Activo = true,
            ResetToken = "token-vencido",
            ResetTokenExpira = DateTime.UtcNow.AddMinutes(-1),
        });

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new RestablecerPasswordCommand("token-vencido", "NuevaPass123!"), CancellationToken.None));
    }

    [Fact]
    public async Task Token_valido_actualiza_password_y_limpia_el_token()
    {
        var (handler, usuarios) = CrearHandler();
        usuarios.Seed(new Usuario
        {
            Email = "erika@ecabogados.mx",
            PasswordHash = "hashed:vieja",
            Nombre = "Erika",
            Rol = "Administrador",
            Activo = true,
            ResetToken = "token-valido",
            ResetTokenExpira = DateTime.UtcNow.AddMinutes(30),
            IntentosFallidos = 3,
        });

        await handler.Handle(new RestablecerPasswordCommand("token-valido", "NuevaPass123!"), CancellationToken.None);

        var usuario = await usuarios.GetByEmailAsync("erika@ecabogados.mx");
        Assert.Equal("hashed:NuevaPass123!", usuario!.PasswordHash);
        Assert.Null(usuario.ResetToken);
        Assert.Null(usuario.ResetTokenExpira);
        Assert.Equal(0, usuario.IntentosFallidos);
    }
}
