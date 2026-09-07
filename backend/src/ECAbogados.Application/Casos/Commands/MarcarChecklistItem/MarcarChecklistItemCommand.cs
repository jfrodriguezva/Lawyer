using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.MarcarChecklistItem;

public record MarcarChecklistItemCommand(int ItemId, bool Completado) : IRequest;
