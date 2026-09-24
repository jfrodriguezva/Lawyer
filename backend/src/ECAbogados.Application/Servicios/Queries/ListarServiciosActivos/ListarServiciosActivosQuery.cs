using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Servicios.Queries.ListarServiciosActivos;

public record ListarServiciosActivosQuery : IRequest<IReadOnlyList<Servicio>>;
