using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Servicios.Commands.ActualizarServicio;

public class ActualizarServicioCommandHandler(IServicioRepository servicioRepository) : IRequestHandler<ActualizarServicioCommand>
{
    public async Task Handle(ActualizarServicioCommand request, CancellationToken cancellationToken)
    {
        var servicio = await servicioRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el servicio con Id {request.Id}");

        servicio.ModuloId = request.ModuloId;
        servicio.Slug = request.Slug;
        servicio.Titulo = request.Titulo;
        servicio.Frase = request.Frase;
        servicio.Descripcion = request.Descripcion;
        servicio.Tipo = request.Tipo;
        servicio.Beneficios = request.Beneficios;
        servicio.Proceso = request.Proceso;
        servicio.Orden = request.Orden;

        await servicioRepository.UpdateAsync(servicio);
    }
}
