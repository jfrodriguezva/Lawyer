using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Queries.ListarMensajesContacto;

public class ListarMensajesContactoQueryHandler(IMensajeContactoRepository mensajeContactoRepository)
    : IRequestHandler<ListarMensajesContactoQuery, IReadOnlyList<MensajeContactoDto>>
{
    public async Task<IReadOnlyList<MensajeContactoDto>> Handle(
        ListarMensajesContactoQuery request, CancellationToken cancellationToken)
    {
        var mensajes = await mensajeContactoRepository.GetAllAsync();

        return mensajes
            .Select(m => new MensajeContactoDto(
                m.Id, m.Nombre, m.Telefono, m.Email, m.Mensaje, m.FechaEnvio, m.Atendido, m.ServicioInteres))
            .ToList();
    }
}
