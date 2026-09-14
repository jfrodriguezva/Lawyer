using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarCasos;

public class ListarCasosQueryHandler(ICasoRepository casoRepository, IUsuarioRepository usuarioRepository)
    : IRequestHandler<ListarCasosQuery, IReadOnlyList<CasoDto>>
{
    public async Task<IReadOnlyList<CasoDto>> Handle(ListarCasosQuery request, CancellationToken cancellationToken)
    {
        var casos = await casoRepository.GetAllAsync();
        var usuarios = await usuarioRepository.GetAllAsync();
        var nombresPorId = usuarios.ToDictionary(u => u.Id, u => u.Nombre);

        return casos
            .Select(c => new CasoDto(
                c.Id, c.ClienteNombre, c.Tipo, c.Estatus, c.FechaApertura, c.Notas,
                c.AbogadoResponsableId,
                c.AbogadoResponsableId is int abogadoId && nombresPorId.TryGetValue(abogadoId, out var nombre) ? nombre : null,
                c.Prioridad, c.FolioInterno, c.Archivado))
            .ToList();
    }
}
