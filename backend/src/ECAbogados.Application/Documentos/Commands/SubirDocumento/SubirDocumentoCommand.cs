using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Documentos.Commands.SubirDocumento;

public record SubirDocumentoCommand(
    int CasoId,
    string NombreArchivo,
    string TipoContenido,
    long TamanoBytes,
    string RutaAlmacenamiento,
    OrigenDocumento SubidoPorTipo,
    int? SubidoPorId,
    string? SubidoPorNombre,
    string? Descripcion = null,
    VisibilidadDocumento? Visibilidad = null) : IRequest<int>;
