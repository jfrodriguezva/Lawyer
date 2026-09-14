using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tareas.Commands.CrearTarea;

public class CrearTareaCommandHandler(
    ITareaCasoRepository tareaRepository,
    INotificacionRepository notificacionRepository) : IRequestHandler<CrearTareaCommand, int>
{
    public async Task<int> Handle(CrearTareaCommand request, CancellationToken cancellationToken)
    {
        var tarea = new TareaCaso
        {
            CasoId = request.CasoId,
            Descripcion = request.Descripcion,
            ResponsableUsuarioId = request.ResponsableUsuarioId,
            FechaVencimiento = request.FechaVencimiento,
            FechaCreacion = DateTime.UtcNow
        };

        var id = await tareaRepository.CreateAsync(tarea);

        if (request.ResponsableUsuarioId is int responsableId)
        {
            await notificacionRepository.CreateAsync(new Notificacion
            {
                DestinatarioTipo = DestinatarioTipo.Usuario,
                DestinatarioId = responsableId,
                Titulo = "Nueva tarea asignada",
                Mensaje = request.Descripcion,
                Fecha = DateTime.UtcNow,
                Enlace = $"/casos/{request.CasoId}"
            });
        }

        return id;
    }
}
