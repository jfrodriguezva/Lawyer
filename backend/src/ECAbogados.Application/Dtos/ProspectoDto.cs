using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record ProspectoDto(
    int Id,
    string Nombre,
    string Email,
    string Telefono,
    string? MedioContactoPreferido,
    string? Origen,
    string? ServicioInteres,
    EstatusConflictoInteres ConflictoInteres,
    int? ResponsableUsuarioId,
    string? ResultadoEntrevista,
    EtapaProspecto Etapa,
    string? MotivoNoContratacion,
    int? ClienteId,
    DateTime FechaCreacion);
