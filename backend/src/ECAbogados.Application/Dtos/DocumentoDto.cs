using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record DocumentoDto(
    int Id,
    int CasoId,
    string NombreArchivo,
    string TipoContenido,
    long TamanoBytes,
    DateTime FechaCarga,
    string? Descripcion,
    string? Categoria,
    VisibilidadDocumento Visibilidad,
    EstatusDocumento Estatus,
    string? ComentarioRevision,
    int Version,
    OrigenDocumento SubidoPorTipo,
    string? SubidoPorNombre,
    bool SoloRegistro);
