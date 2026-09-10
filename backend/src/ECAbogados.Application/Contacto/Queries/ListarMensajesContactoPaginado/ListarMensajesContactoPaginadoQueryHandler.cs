using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Queries.ListarMensajesContactoPaginado;

public class ListarMensajesContactoPaginadoQueryHandler(IMensajeContactoRepository mensajeContactoRepository)
    : IRequestHandler<ListarMensajesContactoPaginadoQuery, PagedResultDto<MensajeContactoDto>>
{
    public async Task<PagedResultDto<MensajeContactoDto>> Handle(ListarMensajesContactoPaginadoQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await mensajeContactoRepository.GetPagedAsync(request.Page, request.PageSize);

        var dtos = items
            .Select(m => new MensajeContactoDto(m.Id, m.Nombre, m.Telefono, m.Email, m.Mensaje, m.FechaEnvio, m.Atendido))
            .ToList();

        return new PagedResultDto<MensajeContactoDto>(dtos, total, request.Page, request.PageSize);
    }
}
