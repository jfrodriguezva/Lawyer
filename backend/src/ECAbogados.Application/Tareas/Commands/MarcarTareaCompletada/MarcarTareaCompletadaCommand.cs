using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Tareas.Commands.MarcarTareaCompletada;

public record MarcarTareaCompletadaCommand(int Id, bool Completada) : IRequest;
