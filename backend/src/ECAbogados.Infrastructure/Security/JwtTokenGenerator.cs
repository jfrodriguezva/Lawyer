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
    public string GenerateToken(Usuario usuario) =>
        GenerarToken(usuario.Id, usuario.Email, usuario.Nombre, usuario.Rol);

    public string GenerateTokenParaCliente(Cliente cliente) =>
        GenerarToken(cliente.Id, cliente.Email, cliente.Nombre, "Cliente");

    private string GenerarToken(int id, string email, string nombre, string rol)
    {
        var secret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("No se encontró la configuración 'Jwt:Secret'.");
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];
        var expiryMinutes = int.TryParse(configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 480;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, nombre),
            new Claim(ClaimTypes.Role, rol)
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
