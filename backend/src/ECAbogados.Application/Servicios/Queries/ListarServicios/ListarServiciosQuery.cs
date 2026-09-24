using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Servicios.Queries.ListarServicios;

public record ListarServiciosQuery(int? ModuloId = null) : IRequest<IReadOnlyList<Servicio>>;
