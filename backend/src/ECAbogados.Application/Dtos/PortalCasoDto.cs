using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record PortalCasoDto(
    int Id,
    string ClienteNombre,
    string Tipo,
    EstatusCaso Estatus,
    DateTime FechaApertura,
    IReadOnlyList<ChecklistItemDto> Checklist,
    IReadOnlyList<DocumentoDto> Documentos);
