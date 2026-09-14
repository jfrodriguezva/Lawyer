using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Tests.Fakes;
using ECAbogados.Application.Usuarios.Commands.CrearUsuario;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests;

public class CrearUsuarioCommandHandlerTests
{
    [Fact]
    public async Task Email_duplicado_lanza_ConflictException()
    {
        var usuarios = new FakeUsuarioRepository();
        usuarios.Seed(new Usuario { Email = "erika@ecabogados.mx", PasswordHash = "x", Nombre = "Erika", Rol = "Administrador" });
        var handler = new CrearUsuarioCommandHandler(usuarios, new FakePasswordHasher());

        await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new CrearUsuarioCommand("erika@ecabogados.mx", "Password123!", "Otra Erika", "Abogado"), CancellationToken.None));
    }

    [Fact]
    public async Task Email_nuevo_crea_usuario_con_password_hasheado()
    {
        var usuarios = new FakeUsuarioRepository();
        var handler = new CrearUsuarioCommandHandler(usuarios, new FakePasswordHasher());

        var id = await handler.Handle(new CrearUsuarioCommand("nueva@ecabogados.mx", "Password123!", "Asistente Nueva", "Abogado"), CancellationToken.None);

        var creado = await usuarios.GetByEmailAsync("nueva@ecabogados.mx");
        Assert.NotNull(creado);
        Assert.Equal(id, creado!.Id);
        Assert.Equal("hashed:Password123!", creado.PasswordHash);
    }
}
