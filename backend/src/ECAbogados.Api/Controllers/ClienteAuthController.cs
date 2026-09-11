using System.Security.Claims;
using ECAbogados.Application.Auth.Commands.LoginCliente;
using ECAbogados.Application.Casos.Queries.ListarCasosPorCliente;
using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

// Autenticación y portal del Cliente (cuenta real, distinta del staff en AuthController
// y del enlace mágico anónimo de PortalController).
[ApiController]
[Route("api/cliente")]
public class ClienteAuthController(ISender sender) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginClienteRequest request)
    {
        try
        {
            var result = await sender.Send(new LoginClienteCommand(request.Email, request.Password));
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Cliente")]
    [HttpGet("mis-casos")]
    public async Task<IActionResult> MisCasos()
    {
        var clienteId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var casos = await sender.Send(new ListarCasosPorClienteQuery(clienteId));
        return Ok(casos);
    }
}

public record LoginClienteRequest(string Email, string Password);
