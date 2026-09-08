using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Commands.CambiarEstatusCita;

public class CambiarEstatusCitaCommandHandler(
    ICitaRepository citaRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<CambiarEstatusCitaCommand>
{
    public async Task Handle(CambiarEstatusCitaCommand request, CancellationToken cancellationToken)
    {
        var cita = await citaRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró la cita con Id {request.Id}");

        await citaRepository.UpdateEstatusAsync(cita.Id, request.Estatus);

        if (cita.CasoId is int casoId)
        {
            await auditoriaRepository.RegistrarAsync(currentUser, "Caso", casoId, $"Cita {request.Estatus}");
        }
    }
}
