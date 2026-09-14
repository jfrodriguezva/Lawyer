using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Notificaciones.Commands.MarcarTodasNotificacionesLeidas;

public record MarcarTodasNotificacionesLeidasCommand(DestinatarioTipo Tipo, int DestinatarioId) : IRequest;
