using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Contacto.Commands.MarcarMensajeAtendido;

public record MarcarMensajeAtendidoCommand(int Id) : IRequest;
