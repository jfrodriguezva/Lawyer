using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Tareas.Commands.CrearTarea;

public record CrearTareaCommand(int CasoId, string Descripcion, int? ResponsableUsuarioId, DateTime? FechaVencimiento) : IRequest<int>;
