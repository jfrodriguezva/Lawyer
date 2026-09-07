using ECAbogados.Application.Dtos;
using MediatR;

namespace ECAbogados.Application.Documentos.Queries.ListarDocumentosPorCaso;

public record ListarDocumentosPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<DocumentoDto>>;
