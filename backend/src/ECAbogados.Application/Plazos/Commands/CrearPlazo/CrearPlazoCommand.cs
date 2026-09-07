using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plazos.Commands.CrearPlazo;

public record CrearPlazoCommand(int CasoId, string Descripcion, DateTime FechaLimite) : IRequest<int>;
