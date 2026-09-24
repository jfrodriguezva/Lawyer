using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Modulos.Queries.ListarModulos;

public class ListarModulosQueryHandler(IModuloRepository moduloRepository) : IRequestHandler<ListarModulosQuery, IReadOnlyList<Modulo>>
{
    public Task<IReadOnlyList<Modulo>> Handle(ListarModulosQuery request, CancellationToken cancellationToken) =>
        moduloRepository.GetAllAsync();
}
