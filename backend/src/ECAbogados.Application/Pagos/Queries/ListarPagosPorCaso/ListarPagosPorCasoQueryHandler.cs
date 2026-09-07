using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Pagos.Queries.ListarPagosPorCaso;

public class ListarPagosPorCasoQueryHandler(IPagoRepository pagoRepository)
    : IRequestHandler<ListarPagosPorCasoQuery, IReadOnlyList<PagoDto>>
{
    public async Task<IReadOnlyList<PagoDto>> Handle(ListarPagosPorCasoQuery request, CancellationToken cancellationToken)
    {
        var pagos = await pagoRepository.GetByCasoIdAsync(request.CasoId);

        return pagos
            .Select(p => new PagoDto(p.Id, p.CasoId, p.Concepto, p.Monto, p.Fecha))
            .ToList();
    }
}
