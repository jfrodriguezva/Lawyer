using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.CambiarEstatusUsuario;

public class CambiarEstatusUsuarioCommandHandler(IUsuarioRepository usuarioRepository)
    : IRequestHandler<CambiarEstatusUsuarioCommand>
{
    public async Task Handle(CambiarEstatusUsuarioCommand request, CancellationToken cancellationToken)
    {
        await usuarioRepository.SetActivoAsync(request.Id, request.Activo);
    }
}
