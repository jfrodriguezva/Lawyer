using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.TramitesSAT.Commands.CrearTramiteSAT;

public class CrearTramiteSATCommandHandler(
    ITramiteSATRepository tramiteRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<CrearTramiteSATCommand, int>
{
    public async Task<int> Handle(CrearTramiteSATCommand request, CancellationToken cancellationToken)
    {
        var tramite = new TramiteSAT
        {
            ClienteId = request.ClienteId,
            CatalogoTramiteId = request.CatalogoTramiteId,
            ResponsableUsuarioId = request.ResponsableUsuarioId,
            FechaLimite = request.FechaLimite,
            Observaciones = request.Observaciones,
            FechaCreacion = DateTime.UtcNow
        };

        var id = await tramiteRepository.CreateAsync(tramite);

        await auditoriaRepository.RegistrarAsync(currentUser, "TramiteSAT", id, "Dio de alta un trámite SAT para el cliente");

        return id;
    }
}
