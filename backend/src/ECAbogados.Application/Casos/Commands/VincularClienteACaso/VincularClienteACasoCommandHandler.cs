using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.VincularClienteACaso;

public class VincularClienteACasoCommandHandler(
    ICasoRepository casoRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<VincularClienteACasoCommand>
{
    public async Task Handle(VincularClienteACasoCommand request, CancellationToken cancellationToken)
    {
        await casoRepository.VincularClienteAsync(request.CasoId, request.ClienteId);

        await auditoriaRepository.RegistrarAsync(currentUser, "Caso", request.CasoId, "Vinculó una cuenta de cliente al expediente");
    }
}
