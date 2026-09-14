using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.ActualizarMiPerfil;

public class ActualizarMiPerfilCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    ICurrentUserAccessor currentUser) : IRequestHandler<ActualizarMiPerfilCommand>
{
    public async Task Handle(ActualizarMiPerfilCommand request, CancellationToken cancellationToken)
    {
        var usuarioId = currentUser.UsuarioId
            ?? throw new UnauthorizedAccessException("Sesión no válida.");

        var usuario = await usuarioRepository.GetByIdAsync(usuarioId)
            ?? throw new KeyNotFoundException("No se encontró tu cuenta.");

        usuario.Nombre = request.Nombre;
        await usuarioRepository.UpdateAsync(usuario);

        if (!string.IsNullOrWhiteSpace(request.NuevaPassword))
        {
            if (!passwordHasher.Verify(request.PasswordActual ?? string.Empty, usuario.PasswordHash))
            {
                throw new UnauthorizedAccessException("Tu contraseña actual no es correcta.");
            }

            await usuarioRepository.UpdatePasswordHashAsync(usuario.Id, passwordHasher.Hash(request.NuevaPassword));
        }
    }
}
