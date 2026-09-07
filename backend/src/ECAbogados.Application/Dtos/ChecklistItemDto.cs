namespace ECAbogados.Application.Dtos;

public record ChecklistItemDto(
    int Id,
    int CasoId,
    string Descripcion,
    bool Completado);
