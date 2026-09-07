using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Commands.CrearMensajeContacto;

public class CrearMensajeContactoCommandHandler(
    IMensajeContactoRepository mensajeContactoRepository,
    IStaffNotifier staffNotifier)
    : IRequestHandler<CrearMensajeContactoCommand, int>
{
    public async Task<int> Handle(CrearMensajeContactoCommand request, CancellationToken cancellationToken)
    {
        var mensaje = new MensajeContacto
        {
            Nombre = request.Nombre,
            Telefono = request.Telefono,
            Email = request.Email,
            Mensaje = request.Mensaje,
            FechaEnvio = DateTime.UtcNow,
            Atendido = false
        };

        var id = await mensajeContactoRepository.CreateAsync(mensaje);

        await staffNotifier.NotifyAsync(
            "Nuevo mensaje de contacto",
            $"{request.Nombre} ({request.Telefono}) escribió: {request.Mensaje}",
            cancellationToken);

        return id;
    }
}
