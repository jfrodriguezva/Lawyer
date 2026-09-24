using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Servicios.Queries.ListarServicios;

public class ListarServiciosQueryHandler(IServicioRepository servicioRepository) : IRequestHandler<ListarServiciosQuery, IReadOnlyList<Servicio>>
{
    public Task<IReadOnlyList<Servicio>> Handle(ListarServiciosQuery request, CancellationToken cancellationToken) =>
        servicioRepository.GetAllAsync(request.ModuloId);
}
