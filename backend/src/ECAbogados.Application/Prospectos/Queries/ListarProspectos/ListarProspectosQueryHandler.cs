using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Prospectos.Queries.ListarProspectos;

public class ListarProspectosQueryHandler(IProspectoRepository prospectoRepository)
    : IRequestHandler<ListarProspectosQuery, IReadOnlyList<ProspectoDto>>
{
    public async Task<IReadOnlyList<ProspectoDto>> Handle(ListarProspectosQuery request, CancellationToken cancellationToken)
    {
        var prospectos = await prospectoRepository.GetAllAsync();
        return prospectos.Select(p => p.ToDto()).ToList();
    }
}
