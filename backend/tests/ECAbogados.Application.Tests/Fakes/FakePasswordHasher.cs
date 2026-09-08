using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Tests.Fakes;

/// <summary>Hash trivial (no criptográfico) solo para pruebas — nunca usar fuera de tests.</summary>
public class FakePasswordHasher : IPasswordHasher
{
    public string Hash(string password) => $"hashed:{password}";

    public bool Verify(string password, string hash) => hash == $"hashed:{password}";
}
