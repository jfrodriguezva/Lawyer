using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Commands.CrearMensajeContacto;

public record CrearMensajeContactoCommand(
    string Nombre,
    string Telefono,
    string? Email,
    string Mensaje,
    string? ServicioInteres = null) : IRequest<int>;
