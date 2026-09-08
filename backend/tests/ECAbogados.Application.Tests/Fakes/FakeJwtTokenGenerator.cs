using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeJwtTokenGenerator : IJwtTokenGenerator
{
    public string GenerateToken(Usuario usuario) => $"token-for-{usuario.Email}";
}
