namespace ECAbogados.Application.Dtos;

public record PlazoDto(
    int Id,
    int CasoId,
    string Descripcion,
    DateTime FechaLimite,
    bool Cumplido);
