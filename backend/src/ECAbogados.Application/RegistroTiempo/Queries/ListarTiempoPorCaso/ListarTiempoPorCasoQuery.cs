using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.RegistrosTiempo.Queries.ListarTiempoPorCaso;

public record ListarTiempoPorCasoQuery(int CasoId) : IRequest<IReadOnlyList<RegistroTiempoDto>>;
