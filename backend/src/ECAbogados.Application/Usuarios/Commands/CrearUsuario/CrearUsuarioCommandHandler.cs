using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Commands.CrearUsuario;

public class CrearUsuarioCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher) : IRequestHandler<CrearUsuarioCommand, int>
{
    public async Task<int> Handle(CrearUsuarioCommand request, CancellationToken cancellationToken)
    {
        var existente = await usuarioRepository.GetByEmailAsync(request.Email);
        if (existente is not null)
        {
            throw new InvalidOperationException("Ya existe un usuario con ese correo.");
        }

        var usuario = new Usuario
        {
            Email = request.Email,
            PasswordHash = passwordHasher.Hash(request.Password),
            Nombre = request.Nombre,
            Rol = request.Rol
        };

        return await usuarioRepository.CreateAsync(usuario);
    }
}
