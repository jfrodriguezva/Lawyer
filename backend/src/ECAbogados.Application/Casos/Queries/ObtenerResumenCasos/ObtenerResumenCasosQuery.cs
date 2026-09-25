using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ObtenerResumenCasos;

// Para el dashboard del panel jurídico: antes se calculaba en el cliente a partir
// de ListarCasosQuery (trae TODOS los casos, sin límite) solo para contar por
// estatus y mostrar los 5 más recientes. Aquí los conteos se calculan en SQL.
public record ResumenCasosDto(
    int Activos,
    int EnRevision,
    int Cerrados,
    IReadOnlyList<CasoDto> ActivosRecientes);

public record ObtenerResumenCasosQuery : IRequest<ResumenCasosDto>;
