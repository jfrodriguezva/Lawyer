using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Documentos.Queries.ListarDocumentosPorCaso;

public record ListarDocumentosPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<DocumentoDto>>;
