using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Modulos.Commands.CrearModulo;

public class CrearModuloCommandHandler(IModuloRepository moduloRepository) : IRequestHandler<CrearModuloCommand, int>
{
    public Task<int> Handle(CrearModuloCommand request, CancellationToken cancellationToken) =>
        moduloRepository.CreateAsync(new Modulo
        {
            Nombre = request.Nombre,
            Slug = request.Slug,
            RolResponsable = request.RolResponsable,
            Orden = request.Orden
        });
}
