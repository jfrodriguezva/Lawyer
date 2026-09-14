using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record ActualizacionCasoDto(
    int Id,
    int CasoId,
    string Texto,
    VisibilidadActualizacion Visibilidad,
    string? UsuarioNombre,
    DateTime Fecha);
