using ECAbogados.Application.Auth.Commands.Login;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class LoginCommandHandlerTests
{
    private static (LoginCommandHandler Handler, FakeUsuarioRepository Usuarios) CrearHandler()
    {
        var usuarios = new FakeUsuarioRepository();
        var handler = new LoginCommandHandler(usuarios, new FakePasswordHasher(), new FakeJwtTokenGenerator());
        return (handler, usuarios);
    }

    [Fact]
    public async Task Credenciales_correctas_devuelve_token()
    {
        var (handler, usuarios) = CrearHandler();
        usuarios.Seed(new Usuario { Email = "erika@ecabogados.mx", PasswordHash = "hashed:Cambiar123!", Nombre = "Erika", Rol = "Administrador", Activo = true });

        var resultado = await handler.Handle(new LoginCommand("erika@ecabogados.mx", "Cambiar123!"), CancellationToken.None);

        Assert.Equal("token-for-erika@ecabogados.mx", resultado.Token);
        Assert.Equal("Administrador", resultado.Rol);
    }

    [Fact]
    public async Task Password_incorrecto_lanza_UnauthorizedAccessException()
    {
        var (handler, usuarios) = CrearHandler();
        usuarios.Seed(new Usuario { Email = "erika@ecabogados.mx", PasswordHash = "hashed:Cambiar123!", Nombre = "Erika", Rol = "Administrador", Activo = true });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new LoginCommand("erika@ecabogados.mx", "incorrecta"), CancellationToken.None));
    }

    [Fact]
    public async Task Usuario_inactivo_lanza_UnauthorizedAccessException()
    {
        var (handler, usuarios) = CrearHandler();
        usuarios.Seed(new Usuario { Email = "asistente@ecabogados.mx", PasswordHash = "hashed:Asistente123!", Nombre = "Asistente", Rol = "Asistente", Activo = false });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new LoginCommand("asistente@ecabogados.mx", "Asistente123!"), CancellationToken.None));
    }

    [Fact]
    public async Task Quinto_intento_fallido_bloquea_la_cuenta_incluso_con_password_correcta()
    {
        var (handler, usuarios) = CrearHandler();
        usuarios.Seed(new Usuario { Email = "erika@ecabogados.mx", PasswordHash = "hashed:Cambiar123!", Nombre = "Erika", Rol = "Administrador", Activo = true });

        for (var i = 0; i < 5; i++)
        {
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                handler.Handle(new LoginCommand("erika@ecabogados.mx", "incorrecta"), CancellationToken.None));
        }

        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new LoginCommand("erika@ecabogados.mx", "Cambiar123!"), CancellationToken.None));

        Assert.Contains("bloqueada", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Login_exitoso_resetea_el_contador_de_intentos_fallidos()
    {
        var (handler, usuarios) = CrearHandler();
        usuarios.Seed(new Usuario { Email = "erika@ecabogados.mx", PasswordHash = "hashed:Cambiar123!", Nombre = "Erika", Rol = "Administrador", Activo = true });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new LoginCommand("erika@ecabogados.mx", "incorrecta"), CancellationToken.None));

        var resultado = await handler.Handle(new LoginCommand("erika@ecabogados.mx", "Cambiar123!"), CancellationToken.None);

        Assert.Equal("token-for-erika@ecabogados.mx", resultado.Token);

        var usuario = await usuarios.GetByEmailAsync("erika@ecabogados.mx");
        Assert.Equal(0, usuario!.IntentosFallidos);
    }
}
