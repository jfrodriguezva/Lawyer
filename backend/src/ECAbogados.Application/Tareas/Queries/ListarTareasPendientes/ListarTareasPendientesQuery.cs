using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Tareas.Queries.ListarTareasPendientes;

// Para el dashboard del Abogado: "tareas vencidas y próximas" en todos los casos.
public record ListarTareasPendientesQuery : IRequest<IReadOnlyList<TareaCasoDto>>;
