using MediatR;

namespace ECAbogados.Application.Contacto.Commands.CrearMensajeContacto;

public record CrearMensajeContactoCommand(
    string Nombre,
    string Telefono,
    string? Email,
    string Mensaje) : IRequest<int>;
