using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Servicios.Commands.CrearServicio;

public class CrearServicioCommandHandler(IServicioRepository servicioRepository) : IRequestHandler<CrearServicioCommand, int>
{
    public Task<int> Handle(CrearServicioCommand request, CancellationToken cancellationToken) =>
        servicioRepository.CreateAsync(new Servicio
        {
            ModuloId = request.ModuloId,
            Slug = request.Slug,
            Titulo = request.Titulo,
            Frase = request.Frase,
            Descripcion = request.Descripcion,
            Tipo = request.Tipo,
            Beneficios = request.Beneficios,
            Proceso = request.Proceso,
            Orden = request.Orden
        });
}
