using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Commands.CambiarActivoPromocion;

public record CambiarActivoPromocionCommand(int Id, bool Activo) : IRequest;
