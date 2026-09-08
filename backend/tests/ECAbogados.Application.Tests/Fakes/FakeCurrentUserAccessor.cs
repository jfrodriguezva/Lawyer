using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeCurrentUserAccessor(int? usuarioId = 1, string? nombre = "Usuario de prueba") : ICurrentUserAccessor
{
    public int? UsuarioId { get; } = usuarioId;
    public string? Nombre { get; } = nombre;
}
