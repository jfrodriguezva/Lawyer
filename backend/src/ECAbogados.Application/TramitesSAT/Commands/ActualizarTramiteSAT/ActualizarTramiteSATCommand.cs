using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.TramitesSAT.Commands.ActualizarTramiteSAT;

public record ActualizarTramiteSATCommand(int Id, EstatusTramiteSAT Estatus, int? ResponsableUsuarioId, DateTime? FechaLimite, string? Observaciones) : IRequest;
