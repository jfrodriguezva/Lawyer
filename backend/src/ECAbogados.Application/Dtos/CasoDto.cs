using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record CasoDto(
    int Id,
    string ClienteNombre,
    string Tipo,
    EstatusCaso Estatus,
    DateTime FechaApertura,
    string? Notas,
    int? AbogadoResponsableId,
    string? AbogadoResponsableNombre,
    string? Prioridad,
    string? FolioInterno,
    bool Archivado);

public record CasoDetalleDto(
    int Id,
    string ClienteNombre,
    string Tipo,
    EstatusCaso Estatus,
    DateTime FechaApertura,
    string? Notas,
    string? TokenAcceso,
    DateTime? TokenGeneradoEn,
    IReadOnlyList<CitaDto> Citas,
    IReadOnlyList<DocumentoDto> Documentos,
    IReadOnlyList<ChecklistItemDto> Checklist,
    int? ClienteVinculadoId,
    string? ClienteVinculadoNombre,
    string? ClienteVinculadoEmail,
    int? AbogadoResponsableId,
    string? AbogadoResponsableNombre,
    string? Prioridad,
    string? FolioInterno,
    string? ContraparteNombre,
    string? AutoridadOrganismo,
    string? NumeroExpedienteExterno,
    DateTime? FechaCierre,
    string? MotivoCierre,
    bool Archivado,
    decimal? MontoAcordado,
    IReadOnlyList<ActualizacionCasoDto> Actualizaciones,
    IReadOnlyList<TareaCasoDto> Tareas);
