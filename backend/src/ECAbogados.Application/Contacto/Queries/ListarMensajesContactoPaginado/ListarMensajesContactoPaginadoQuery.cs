using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Queries.ListarMensajesContactoPaginado;

public record ListarMensajesContactoPaginadoQuery(int Page = 1, int PageSize = 20)
    : IRequest<PagedResultDto<MensajeContactoDto>>;
