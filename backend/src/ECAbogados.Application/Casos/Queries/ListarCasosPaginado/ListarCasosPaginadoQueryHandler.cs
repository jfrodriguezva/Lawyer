using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Queries.ListarCasosPaginado;

public class ListarCasosPaginadoQueryHandler(ICasoRepository casoRepository, IUsuarioRepository usuarioRepository)
    : IRequestHandler<ListarCasosPaginadoQuery, PagedResultDto<CasoDto>>
{
    public async Task<PagedResultDto<CasoDto>> Handle(ListarCasosPaginadoQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await casoRepository.GetPagedAsync(request.Page, request.PageSize, request.Search);
        var usuarios = await usuarioRepository.GetAllAsync();
        var nombresPorId = usuarios.ToDictionary(u => u.Id, u => u.Nombre);

        var dtos = items
            .Select(c => new CasoDto(
                c.Id, c.ClienteNombre, c.Tipo, c.Estatus, c.FechaApertura, c.Notas,
                c.AbogadoResponsableId,
                c.AbogadoResponsableId is int abogadoId && nombresPorId.TryGetValue(abogadoId, out var nombre) ? nombre : null,
                c.Prioridad, c.FolioInterno, c.Archivado))
            .ToList();

        return new PagedResultDto<CasoDto>(dtos, total, request.Page, request.PageSize);
    }
}
