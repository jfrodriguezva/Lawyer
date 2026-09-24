using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Promociones.Queries.ListarPromociones;

public record ListarPromocionesQuery : IRequest<IReadOnlyList<Promocion>>;
