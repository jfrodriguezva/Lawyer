using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record TramiteSATDto(
    int Id,
    int ClienteId,
    string? ClienteNombre,
    int CatalogoTramiteId,
    string? CatalogoTramiteNombre,
    EstatusTramiteSAT Estatus,
    int? ResponsableUsuarioId,
    string? ResponsableNombre,
    DateTime? FechaLimite,
    string? Observaciones,
    DateTime FechaCreacion);
