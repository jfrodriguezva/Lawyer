using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Tareas.Queries.ListarTareasPorCaso;

public record ListarTareasPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<TareaCasoDto>>;
