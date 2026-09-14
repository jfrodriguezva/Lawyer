namespace ECAbogados.Application.Dtos;

public record TareaCasoDto(
    int Id,
    int CasoId,
    string Descripcion,
    int? ResponsableUsuarioId,
    string? ResponsableNombre,
    DateTime? FechaVencimiento,
    bool Completada,
    DateTime FechaCreacion);
