namespace ECAbogados.Application.Dtos;

public record RegistroTiempoDto(
    int Id,
    int CasoId,
    int UsuarioId,
    string? UsuarioNombre,
    int Minutos,
    string? Descripcion,
    DateTime Fecha);
