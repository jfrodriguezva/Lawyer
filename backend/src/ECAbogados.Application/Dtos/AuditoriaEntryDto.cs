namespace ECAbogados.Application.Dtos;

public record AuditoriaEntryDto(
    int Id,
    string Accion,
    string? Detalle,
    string? UsuarioNombre,
    DateTime Fecha);
