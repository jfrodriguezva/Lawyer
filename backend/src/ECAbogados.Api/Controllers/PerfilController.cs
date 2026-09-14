using ECAbogados.Application.Mediation;
using ECAbogados.Application.Usuarios.Commands.ActualizarMiPerfil;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

// Autoservicio para cualquier miembro del staff (a diferencia de UsuariosController,
// que es exclusivo de Administrador para gestionar A OTROS usuarios): aquí cada
// quien solo puede tocar su propio nombre/contraseña, nunca su rol.
[Authorize(Roles = "Abogado,Consultor,Agente,Administrador")]
[ApiController]
[Route("api/perfil")]
public class PerfilController(ISender sender) : ControllerBase
{
    [HttpPut]
    public async Task<IActionResult> Actualizar([FromBody] ActualizarMiPerfilCommand command)
    {
        await sender.Send(command);
        return NoContent();
    }
}
