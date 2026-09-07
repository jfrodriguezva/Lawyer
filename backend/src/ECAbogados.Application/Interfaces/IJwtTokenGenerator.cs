using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(Usuario usuario);
}
