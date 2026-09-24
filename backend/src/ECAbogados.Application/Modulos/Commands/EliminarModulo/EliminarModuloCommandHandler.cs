using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Modulos.Commands.EliminarModulo;

public class EliminarModuloCommandHandler(IModuloRepository moduloRepository) : IRequestHandler<EliminarModuloCommand>
{
    public Task Handle(EliminarModuloCommand request, CancellationToken cancellationToken) =>
        moduloRepository.DeleteConServiciosAsync(request.Id);
}
