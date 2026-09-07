using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Queries.ListarMensajesContacto;

public record ListarMensajesContactoQuery : IRequest<IReadOnlyList<MensajeContactoDto>>;
