using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record NotificacionDto(
    int Id,
    string Titulo,
    string Mensaje,
    bool Leida,
    DateTime Fecha,
    string? Enlace);
