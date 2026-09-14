using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Notificaciones.Commands.MarcarNotificacionLeida;

public record MarcarNotificacionLeidaCommand(int Id) : IRequest;
