using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using MediatR;

namespace ECAbogados.Application.Casos.Queries.ListarCasos;

public class ListarCasosQueryHandler(ICasoRepository casoRepository)
    : IRequestHandler<ListarCasosQuery, IReadOnlyList<CasoDto>>
{
    public async Task<IReadOnlyList<CasoDto>> Handle(ListarCasosQuery request, CancellationToken cancellationToken)
    {
        var casos = await casoRepository.GetAllAsync();

        return casos
            .Select(c => new CasoDto(c.Id, c.ClienteNombre, c.Tipo, c.Estatus, c.FechaApertura, c.Notas))
            .ToList();
    }
}
