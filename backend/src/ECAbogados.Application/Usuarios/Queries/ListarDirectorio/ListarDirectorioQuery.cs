using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Usuarios.Queries.ListarDirectorio;

// Versión mínima de la lista de staff (solo Id + Nombre, sin correo/rol) para
// que Abogado y Consultor puedan elegir un "responsable" sin ver el directorio
// administrativo completo (que sigue siendo exclusivo de Administrador).
public record ListarDirectorioQuery : IRequest<IReadOnlyList<DirectorioUsuarioDto>>;

public record DirectorioUsuarioDto(int Id, string Nombre);
