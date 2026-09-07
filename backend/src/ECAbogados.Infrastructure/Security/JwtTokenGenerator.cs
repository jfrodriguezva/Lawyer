using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ECAbogados.Infrastructure.Security;

public class JwtTokenGenerator(IConfiguration configuration) : IJwtTokenGenerator
{
    public string GenerateToken(Usuario usuario)
    {
        var secret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("No se encontró la configuración 'Jwt:Secret'.");
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];
        var expiryMinutes = int.TryParse(configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 480;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Role, usuario.Rol)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
