using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Modulos.Commands.ActualizarModulo;

public class ActualizarModuloCommandHandler(IModuloRepository moduloRepository) : IRequestHandler<ActualizarModuloCommand>
{
    public async Task Handle(ActualizarModuloCommand request, CancellationToken cancellationToken)
    {
        var modulo = await moduloRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el módulo con Id {request.Id}");

        modulo.Nombre = request.Nombre;
        modulo.Slug = request.Slug;
        modulo.RolResponsable = request.RolResponsable;
        modulo.Orden = request.Orden;

        await moduloRepository.UpdateAsync(modulo);
    }
}
