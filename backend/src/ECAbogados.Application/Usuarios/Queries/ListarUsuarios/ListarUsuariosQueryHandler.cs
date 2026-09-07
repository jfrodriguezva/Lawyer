using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Queries.ListarUsuarios;

public class ListarUsuariosQueryHandler(IUsuarioRepository usuarioRepository)
    : IRequestHandler<ListarUsuariosQuery, IReadOnlyList<UsuarioDto>>
{
    public async Task<IReadOnlyList<UsuarioDto>> Handle(ListarUsuariosQuery request, CancellationToken cancellationToken)
    {
        var usuarios = await usuarioRepository.GetAllAsync();

        return usuarios
            .Select(u => new UsuarioDto(u.Id, u.Email, u.Nombre, u.Rol))
            .ToList();
    }
}
