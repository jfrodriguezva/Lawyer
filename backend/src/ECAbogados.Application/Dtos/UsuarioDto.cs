namespace ECAbogados.Application.Dtos;

public record UsuarioDto(
    int Id,
    string Email,
    string Nombre,
    string Rol,
    bool Activo);
