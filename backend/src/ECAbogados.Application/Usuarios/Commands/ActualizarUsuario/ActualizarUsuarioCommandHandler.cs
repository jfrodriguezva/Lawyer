using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.ActualizarUsuario;

public class ActualizarUsuarioCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher) : IRequestHandler<ActualizarUsuarioCommand>
{
    public async Task Handle(ActualizarUsuarioCommand request, CancellationToken cancellationToken)
    {
        await usuarioRepository.UpdateAsync(new Domain.Entities.Usuario
        {
            Id = request.Id,
            Nombre = request.Nombre,
            Rol = request.Rol
        });

        if (!string.IsNullOrWhiteSpace(request.NuevaPassword))
        {
            await usuarioRepository.UpdatePasswordHashAsync(request.Id, passwordHasher.Hash(request.NuevaPassword));
        }
    }
}
