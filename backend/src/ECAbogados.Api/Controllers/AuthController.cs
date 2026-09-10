using ECAbogados.Application.Auth.Commands.Login;
using ECAbogados.Application.Auth.Commands.RestablecerPassword;
using ECAbogados.Application.Auth.Commands.SolicitarResetPassword;
using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ECAbogados.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ISender sender) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await sender.Send(new LoginCommand(request.Email, request.Password));
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpPost("olvide-password")]
    public async Task<IActionResult> OlvidePassword([FromBody] OlvidePasswordRequest request)
    {
        await sender.Send(new SolicitarResetPasswordCommand(request.Email));
        // Siempre 200: no revela si el correo existe o no.
        return Ok(new { message = "Si el correo existe, te enviamos un enlace para restablecer tu contraseña." });
    }

    [AllowAnonymous]
    [EnableRateLimiting("public")]
    [HttpPost("restablecer-password")]
    public async Task<IActionResult> RestablecerPassword([FromBody] RestablecerPasswordRequest request)
    {
        try
        {
            await sender.Send(new RestablecerPasswordCommand(request.Token, request.NuevaPassword));
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record OlvidePasswordRequest(string Email);

public record RestablecerPasswordRequest(string Token, string NuevaPassword);
