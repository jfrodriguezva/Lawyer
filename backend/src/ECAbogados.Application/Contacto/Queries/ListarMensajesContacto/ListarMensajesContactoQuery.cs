using ECAbogados.Application.Dtos;
using MediatR;

namespace ECAbogados.Application.Contacto.Queries.ListarMensajesContacto;

public record ListarMensajesContactoQuery : IRequest<IReadOnlyList<MensajeContactoDto>>;
