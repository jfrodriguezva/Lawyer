using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using MediatR;

namespace ECAbogados.Application.Contacto.Commands.CrearMensajeContacto;

public class CrearMensajeContactoCommandHandler(IMensajeContactoRepository mensajeContactoRepository)
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

        return await mensajeContactoRepository.CreateAsync(mensaje);
    }
}
