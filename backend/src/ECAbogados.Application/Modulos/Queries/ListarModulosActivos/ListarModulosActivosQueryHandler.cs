using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Modulos.Queries.ListarModulosActivos;

public class ListarModulosActivosQueryHandler(IModuloRepository moduloRepository) : IRequestHandler<ListarModulosActivosQuery, IReadOnlyList<Modulo>>
{
    // Devuelve TODOS los módulos (no solo los Activo=1): el NavBar público
    // necesita conocer también los inactivos para mostrarlos como "Próximamente".
    public Task<IReadOnlyList<Modulo>> Handle(ListarModulosActivosQuery request, CancellationToken cancellationToken) =>
        moduloRepository.GetAllAsync();
}
