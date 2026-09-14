using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Tareas.Queries.ListarTareasPendientes;

public class ListarTareasPendientesQueryHandler(ITareaCasoRepository tareaRepository, IUsuarioRepository usuarioRepository)
    : IRequestHandler<ListarTareasPendientesQuery, IReadOnlyList<TareaCasoDto>>
{
    public async Task<IReadOnlyList<TareaCasoDto>> Handle(ListarTareasPendientesQuery request, CancellationToken cancellationToken)
    {
        var tareas = await tareaRepository.GetPendientesAsync();
        var usuarios = await usuarioRepository.GetAllAsync();
        var nombresPorId = usuarios.ToDictionary(u => u.Id, u => u.Nombre);

        return tareas
            .Select(t => new TareaCasoDto(
                t.Id, t.CasoId, t.Descripcion, t.ResponsableUsuarioId,
                t.ResponsableUsuarioId is int rid && nombresPorId.TryGetValue(rid, out var nombre) ? nombre : null,
                t.FechaVencimiento, t.Completada, t.FechaCreacion))
            .ToList();
    }
}
