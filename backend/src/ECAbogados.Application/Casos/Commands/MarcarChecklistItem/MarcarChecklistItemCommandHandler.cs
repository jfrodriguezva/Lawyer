using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.MarcarChecklistItem;

public class MarcarChecklistItemCommandHandler(
    IChecklistItemRepository checklistItemRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<MarcarChecklistItemCommand>
{
    public async Task Handle(MarcarChecklistItemCommand request, CancellationToken cancellationToken)
    {
        await checklistItemRepository.SetCompletadoAsync(request.ItemId, request.Completado);

        var item = await checklistItemRepository.GetByIdAsync(request.ItemId);
        if (item is not null)
        {
            var accion = request.Completado ? "Marcó" : "Desmarcó";
            await auditoriaRepository.RegistrarAsync(currentUser, "Caso", item.CasoId, $"{accion} requisito: {item.Descripcion}");
        }
    }
}
