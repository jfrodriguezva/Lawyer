using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Servicios.Queries.ListarServiciosActivos;

public class ListarServiciosActivosQueryHandler(IServicioRepository servicioRepository) : IRequestHandler<ListarServiciosActivosQuery, IReadOnlyList<Servicio>>
{
    public Task<IReadOnlyList<Servicio>> Handle(ListarServiciosActivosQuery request, CancellationToken cancellationToken) =>
        servicioRepository.GetActivosAsync();
}
