namespace ECAbogados.Application.Dtos;

public record AuditoriaEntryDto(
    int Id,
    string Accion,
    string? Detalle,
    string? UsuarioNombre,
    DateTime Fecha);

public record AuditoriaGlobalEntryDto(
    int Id,
    string Entidad,
    int EntidadId,
    string Accion,
    string? Detalle,
    string? UsuarioNombre,
    DateTime Fecha,
    string? Ip);
