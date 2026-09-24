using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Queries.ListarPromocionesActivas;

// DTO público: nunca expone la ruta de almacenamiento en disco. El frontend arma
// la URL de la imagen con el Id (GET /api/promociones/{id}/imagen).
public record PromocionPublicaDto(int Id, string Texto, IReadOnlyList<int> ServicioIds);

public record ListarPromocionesActivasQuery : IRequest<IReadOnlyList<PromocionPublicaDto>>;
