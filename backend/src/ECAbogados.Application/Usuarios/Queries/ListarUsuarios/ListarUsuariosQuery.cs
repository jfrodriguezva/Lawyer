using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Queries.ListarUsuarios;

public record ListarUsuariosQuery : IRequest<IReadOnlyList<UsuarioDto>>;
