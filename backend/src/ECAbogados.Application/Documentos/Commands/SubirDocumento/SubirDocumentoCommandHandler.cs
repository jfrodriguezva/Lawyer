using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Documentos.Commands.SubirDocumento;

public class SubirDocumentoCommandHandler(IDocumentoRepository documentoRepository)
    : IRequestHandler<SubirDocumentoCommand, int>
{
    public async Task<int> Handle(SubirDocumentoCommand request, CancellationToken cancellationToken)
    {
        var documento = new Documento
        {
            CasoId = request.CasoId,
            NombreArchivo = request.NombreArchivo,
            TipoContenido = request.TipoContenido,
            TamanoBytes = request.TamanoBytes,
            FechaCarga = DateTime.UtcNow,
            RutaAlmacenamiento = request.RutaAlmacenamiento
        };

        return await documentoRepository.CreateAsync(documento);
    }
}
