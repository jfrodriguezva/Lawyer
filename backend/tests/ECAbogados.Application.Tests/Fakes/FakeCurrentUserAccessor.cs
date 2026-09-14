using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeCurrentUserAccessor(int? usuarioId = 1, string? nombre = "Usuario de prueba") : ICurrentUserAccessor
{
    public int? UsuarioId { get; } = usuarioId;
    public string? Nombre { get; } = nombre;
    public string? Ip { get; } = "127.0.0.1";
    public string? UserAgent { get; } = "FakeAgent/1.0";
}
