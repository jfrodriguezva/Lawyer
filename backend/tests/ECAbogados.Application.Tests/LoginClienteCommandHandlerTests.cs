using ECAbogados.Application.Auth.Commands.LoginCliente;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class LoginClienteCommandHandlerTests
{
    private static (LoginClienteCommandHandler Handler, FakeClienteRepository Clientes) CrearHandler()
    {
        var clientes = new FakeClienteRepository();
        var handler = new LoginClienteCommandHandler(clientes, new FakePasswordHasher(), new FakeJwtTokenGenerator());
        return (handler, clientes);
    }

    [Fact]
    public async Task Credenciales_correctas_devuelve_token()
    {
        var (handler, clientes) = CrearHandler();
        clientes.Seed(new Cliente { Email = "cliente@correo.com", PasswordHash = "hashed:Cambiar123!", Nombre = "Cliente Uno", Activo = true });

        var resultado = await handler.Handle(new LoginClienteCommand("cliente@correo.com", "Cambiar123!"), CancellationToken.None);

        Assert.Equal("token-for-cliente@correo.com", resultado.Token);
        Assert.Equal("Cliente", resultado.Rol);
    }

    [Fact]
    public async Task Password_incorrecto_lanza_UnauthorizedAccessException()
    {
        var (handler, clientes) = CrearHandler();
        clientes.Seed(new Cliente { Email = "cliente@correo.com", PasswordHash = "hashed:Cambiar123!", Nombre = "Cliente Uno", Activo = true });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new LoginClienteCommand("cliente@correo.com", "incorrecta"), CancellationToken.None));
    }

    [Fact]
    public async Task Cliente_inactivo_lanza_UnauthorizedAccessException()
    {
        var (handler, clientes) = CrearHandler();
        clientes.Seed(new Cliente { Email = "cliente@correo.com", PasswordHash = "hashed:Cambiar123!", Nombre = "Cliente Uno", Activo = false });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new LoginClienteCommand("cliente@correo.com", "Cambiar123!"), CancellationToken.None));
    }

    [Fact]
    public async Task Quinto_intento_fallido_bloquea_la_cuenta_incluso_con_password_correcta()
    {
        var (handler, clientes) = CrearHandler();
        clientes.Seed(new Cliente { Email = "cliente@correo.com", PasswordHash = "hashed:Cambiar123!", Nombre = "Cliente Uno", Activo = true });

        for (var i = 0; i < 5; i++)
        {
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                handler.Handle(new LoginClienteCommand("cliente@correo.com", "incorrecta"), CancellationToken.None));
        }

        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(new LoginClienteCommand("cliente@correo.com", "Cambiar123!"), CancellationToken.None));

        Assert.Contains("bloqueada", ex.Message, StringComparison.OrdinalIgnoreCase);
    }
}
