using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record ClienteDto(
    int Id,
    string Email,
    string Nombre,
    bool Activo,
    TipoPersona TipoPersona,
    string? Rfc,
    string? Telefono,
    bool InvitacionPendiente,
    DateTime FechaCreacion);
