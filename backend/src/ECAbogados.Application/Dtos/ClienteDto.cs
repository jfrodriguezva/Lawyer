namespace ECAbogados.Application.Dtos;

public record ClienteDto(
    int Id,
    string Email,
    string Nombre,
    bool Activo);
