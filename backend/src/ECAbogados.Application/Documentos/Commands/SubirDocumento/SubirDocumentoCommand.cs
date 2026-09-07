using MediatR;

namespace ECAbogados.Application.Documentos.Commands.SubirDocumento;

public record SubirDocumentoCommand(
    int CasoId,
    string NombreArchivo,
    string TipoContenido,
    long TamanoBytes,
    string RutaAlmacenamiento) : IRequest<int>;
