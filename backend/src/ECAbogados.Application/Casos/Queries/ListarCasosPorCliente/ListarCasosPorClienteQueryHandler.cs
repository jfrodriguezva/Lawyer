using ECAbogados.Application.Casos.Queries.ObtenerCasoPorToken;
using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarCasosPorCliente;

public class ListarCasosPorClienteQueryHandler(
    ICasoRepository casoRepository,
    IDocumentoRepository documentoRepository,
    IChecklistItemRepository checklistItemRepository,
    IActualizacionCasoRepository actualizacionCasoRepository,
    ICitaRepository citaRepository)
    : IRequestHandler<ListarCasosPorClienteQuery, IReadOnlyList<PortalCasoDto>>
{
    public async Task<IReadOnlyList<PortalCasoDto>> Handle(ListarCasosPorClienteQuery request, CancellationToken cancellationToken)
    {
        // Un Cliente puede tener varios Casos (multi-caso): cada uno se arma por
        // separado con su propia documentación, sin cruzar información entre ellos.
        var casos = await casoRepository.GetByClienteIdAsync(request.ClienteId);

        var resultado = new List<PortalCasoDto>();
        foreach (var caso in casos)
        {
            resultado.Add(await PortalCasoMapper.BuildAsync(
                caso, documentoRepository, checklistItemRepository, actualizacionCasoRepository, citaRepository));
        }

        return resultado;
    }
}
