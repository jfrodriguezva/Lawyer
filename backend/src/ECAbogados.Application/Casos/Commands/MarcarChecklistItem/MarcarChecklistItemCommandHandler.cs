using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.MarcarChecklistItem;

public class MarcarChecklistItemCommandHandler(IChecklistItemRepository checklistItemRepository)
    : IRequestHandler<MarcarChecklistItemCommand>
{
    public async Task Handle(MarcarChecklistItemCommand request, CancellationToken cancellationToken)
    {
        await checklistItemRepository.SetCompletadoAsync(request.ItemId, request.Completado);
    }
}
