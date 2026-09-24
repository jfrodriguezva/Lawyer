using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Modulos.Commands.CambiarActivoModulo;

public class CambiarActivoModuloCommandHandler(IModuloRepository moduloRepository) : IRequestHandler<CambiarActivoModuloCommand>
{
    public Task Handle(CambiarActivoModuloCommand request, CancellationToken cancellationToken) =>
        moduloRepository.SetActivoAsync(request.Id, request.Activo);
}
