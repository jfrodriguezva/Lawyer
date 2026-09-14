using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Casos.Commands.CrearActualizacionCaso;

public class CrearActualizacionCasoCommandHandler(
    ICasoRepository casoRepository,
    IActualizacionCasoRepository actualizacionCasoRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<CrearActualizacionCasoCommand, int>
{
    public async Task<int> Handle(CrearActualizacionCasoCommand request, CancellationToken cancellationToken)
    {
        _ = await casoRepository.GetByIdAsync(request.CasoId)
            ?? throw new KeyNotFoundException($"No se encontró el caso con Id {request.CasoId}");

        var actualizacion = new ActualizacionCaso
        {
            CasoId = request.CasoId,
            Texto = request.Texto,
            Visibilidad = request.Visibilidad,
            UsuarioId = currentUser.UsuarioId ?? 0,
            UsuarioNombre = currentUser.Nombre,
            Fecha = DateTime.UtcNow
        };

        var id = await actualizacionCasoRepository.CreateAsync(actualizacion);

        var descripcion = request.Visibilidad == VisibilidadActualizacion.Compartida
            ? "Agregó una actualización visible para el cliente"
            : "Agregó una nota interna";
        await auditoriaRepository.RegistrarAsync(currentUser, "Caso", request.CasoId, descripcion);

        return id;
    }
}
