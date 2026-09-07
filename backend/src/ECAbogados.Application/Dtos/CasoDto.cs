using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record CasoDto(
    int Id,
    string ClienteNombre,
    string Tipo,
    EstatusCaso Estatus,
    DateTime FechaApertura,
    string? Notas);

public record CasoDetalleDto(
    int Id,
    string ClienteNombre,
    string Tipo,
    EstatusCaso Estatus,
    DateTime FechaApertura,
    string? Notas,
    IReadOnlyList<CitaDto> Citas,
    IReadOnlyList<DocumentoDto> Documentos);
