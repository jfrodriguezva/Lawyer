using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Commands.EliminarPromocion;

public record EliminarPromocionCommand(int Id) : IRequest;
