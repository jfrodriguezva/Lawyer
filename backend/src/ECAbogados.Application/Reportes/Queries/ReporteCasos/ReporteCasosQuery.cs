using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Reportes.Queries.ReporteCasos;

public record ReporteCasosQuery(
    DateTime? Desde,
    DateTime? Hasta,
    int? AbogadoResponsableId,
    string? Tipo,
    EstatusCaso? Estatus) : IRequest<ReporteCasosDto>;

public record ReporteCasosDto(
    int TotalCasos,
    IReadOnlyDictionary<string, int> PorEstatus,
    IReadOnlyDictionary<string, int> PorTipo,
    IReadOnlyDictionary<string, int> PorAbogado,
    IReadOnlyList<CasoDto> Casos);
