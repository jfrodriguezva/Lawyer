using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Servicios.Commands.CambiarActivoServicio;

public class CambiarActivoServicioCommandHandler(IServicioRepository servicioRepository) : IRequestHandler<CambiarActivoServicioCommand>
{
    public Task Handle(CambiarActivoServicioCommand request, CancellationToken cancellationToken) =>
        servicioRepository.SetActivoAsync(request.Id, request.Activo);
}
