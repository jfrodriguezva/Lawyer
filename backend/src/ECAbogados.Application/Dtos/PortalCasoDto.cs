using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

// DTO expuesto al Cliente (portal autenticado y enlace mágico): nunca incluye
// Notas internas, AbogadoResponsableId, ni actualizaciones con Visibilidad = Interna.
public record PortalCasoDto(
    int Id,
    string ClienteNombre,
    string Tipo,
    EstatusCaso Estatus,
    DateTime FechaApertura,
    IReadOnlyList<ChecklistItemDto> Checklist,
    IReadOnlyList<DocumentoDto> Documentos,
    IReadOnlyList<ActualizacionCasoDto> Actualizaciones,
    IReadOnlyList<CitaDto> ProximasCitas);
