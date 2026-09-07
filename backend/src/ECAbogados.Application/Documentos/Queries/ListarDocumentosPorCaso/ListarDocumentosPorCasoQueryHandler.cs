using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Documentos.Queries.ListarDocumentosPorCaso;

public class ListarDocumentosPorCasoQueryHandler(IDocumentoRepository documentoRepository)
    : IRequestHandler<ListarDocumentosPorCasoQuery, IReadOnlyList<DocumentoDto>>
{
    public async Task<IReadOnlyList<DocumentoDto>> Handle(ListarDocumentosPorCasoQuery request, CancellationToken cancellationToken)
    {
        var documentos = await documentoRepository.GetByCasoIdAsync(request.CasoId);

        return documentos
            .Select(d => new DocumentoDto(d.Id, d.CasoId, d.NombreArchivo, d.TipoContenido, d.TamanoBytes, d.FechaCarga, d.RutaAlmacenamiento))
            .ToList();
    }
}
