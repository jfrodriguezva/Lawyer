using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Servicios.Commands.EliminarServicio;

public class EliminarServicioCommandHandler(IServicioRepository servicioRepository) : IRequestHandler<EliminarServicioCommand>
{
    public Task Handle(EliminarServicioCommand request, CancellationToken cancellationToken) =>
        servicioRepository.DeleteAsync(request.Id);
}
