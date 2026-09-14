using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.RegistrosTiempo.Queries.ListarTiempoPorCaso;

public class ListarTiempoPorCasoQueryHandler(IRegistroTiempoRepository registroTiempoRepository)
    : IRequestHandler<ListarTiempoPorCasoQuery, IReadOnlyList<RegistroTiempoDto>>
{
    public async Task<IReadOnlyList<RegistroTiempoDto>> Handle(ListarTiempoPorCasoQuery request, CancellationToken cancellationToken)
    {
        var registros = await registroTiempoRepository.GetByCasoIdAsync(request.CasoId);

        return registros
            .Select(r => new RegistroTiempoDto(r.Id, r.CasoId, r.UsuarioId, r.UsuarioNombre, r.Minutos, r.Descripcion, r.Fecha))
            .ToList();
    }
}
