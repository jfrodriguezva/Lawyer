using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Notificaciones.Queries.ListarMisNotificaciones;

public record ListarMisNotificacionesQuery(DestinatarioTipo Tipo, int DestinatarioId) : IRequest<IReadOnlyList<NotificacionDto>>;
