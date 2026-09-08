using System.Security.Claims;
using ECAbogados.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ECAbogados.Infrastructure.Security;

public class CurrentUserAccessor(IHttpContextAccessor httpContextAccessor) : ICurrentUserAccessor
{
    public int? UsuarioId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Nombre => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
}
