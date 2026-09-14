using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.TramitesSAT.Commands.CrearTramiteSAT;

public record CrearTramiteSATCommand(int ClienteId, int CatalogoTramiteId, int? ResponsableUsuarioId, DateTime? FechaLimite, string? Observaciones) : IRequest<int>;
