namespace ECAbogados.Application.Dtos;

public record DocumentoDto(
    int Id,
    int CasoId,
    string NombreArchivo,
    string TipoContenido,
    long TamanoBytes,
    DateTime FechaCarga,
    string RutaAlmacenamiento);
