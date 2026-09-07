using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Pagos.Queries.ListarPagosPorCaso;

public record ListarPagosPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<PagoDto>>;
