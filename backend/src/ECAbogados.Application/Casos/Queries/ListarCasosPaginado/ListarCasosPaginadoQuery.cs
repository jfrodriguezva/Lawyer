using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarCasosPaginado;

public record ListarCasosPaginadoQuery(int Page = 1, int PageSize = 20, string? Search = null)
    : IRequest<PagedResultDto<CasoDto>>;
