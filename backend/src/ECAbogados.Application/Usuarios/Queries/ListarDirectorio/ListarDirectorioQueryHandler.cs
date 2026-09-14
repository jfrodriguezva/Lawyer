using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Queries.ListarDirectorio;

public class ListarDirectorioQueryHandler(IUsuarioRepository usuarioRepository) : IRequestHandler<ListarDirectorioQuery, IReadOnlyList<DirectorioUsuarioDto>>
{
    public async Task<IReadOnlyList<DirectorioUsuarioDto>> Handle(ListarDirectorioQuery request, CancellationToken cancellationToken)
    {
        var usuarios = await usuarioRepository.GetAllAsync();
        return usuarios.Where(u => u.Activo).Select(u => new DirectorioUsuarioDto(u.Id, u.Nombre)).ToList();
    }
}
