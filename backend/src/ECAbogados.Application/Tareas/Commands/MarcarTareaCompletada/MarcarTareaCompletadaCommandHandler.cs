using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Tareas.Commands.MarcarTareaCompletada;

public class MarcarTareaCompletadaCommandHandler(ITareaCasoRepository tareaRepository) : IRequestHandler<MarcarTareaCompletadaCommand>
{
    public Task Handle(MarcarTareaCompletadaCommand request, CancellationToken cancellationToken) =>
        tareaRepository.SetCompletadaAsync(request.Id, request.Completada);
}
