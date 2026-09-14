using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.TramitesSAT.Commands.ActualizarTramiteSAT;

public class ActualizarTramiteSATCommandHandler(
    ITramiteSATRepository tramiteRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<ActualizarTramiteSATCommand>
{
    public async Task Handle(ActualizarTramiteSATCommand request, CancellationToken cancellationToken)
    {
        var tramite = await tramiteRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el trámite SAT con Id {request.Id}");

        tramite.Estatus = request.Estatus;
        tramite.ResponsableUsuarioId = request.ResponsableUsuarioId;
        tramite.FechaLimite = request.FechaLimite;
        tramite.Observaciones = request.Observaciones;

        await tramiteRepository.UpdateAsync(tramite);

        await auditoriaRepository.RegistrarAsync(currentUser, "TramiteSAT", tramite.Id, $"Actualizó el trámite SAT a estatus {request.Estatus}");
    }
}
