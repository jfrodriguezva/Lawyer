using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;

public class CambiarEstatusCasoCommandHandler(
    ICasoRepository casoRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<CambiarEstatusCasoCommand>
{
    public async Task Handle(CambiarEstatusCasoCommand request, CancellationToken cancellationToken)
    {
        var caso = await casoRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el caso con Id {request.Id}");

        var reapertura = caso.Estatus == EstatusCaso.Cerrado && request.Estatus != EstatusCaso.Cerrado;

        caso.Estatus = request.Estatus;

        if (request.Estatus == EstatusCaso.Cerrado)
        {
            caso.FechaCierre = DateTime.UtcNow;
            caso.MotivoCierre = request.Motivo;
        }
        else if (reapertura)
        {
            caso.FechaCierre = null;
            caso.MotivoCierre = null;
        }

        await casoRepository.UpdateAsync(caso);

        var descripcion = request.Estatus == EstatusCaso.Cerrado
            ? $"Cerró el expediente. Motivo: {request.Motivo}"
            : reapertura
                ? $"Reabrió el expediente. Motivo: {request.Motivo}"
                : $"Cambió el estatus a {request.Estatus}";

        await auditoriaRepository.RegistrarAsync(currentUser, "Caso", caso.Id, descripcion);
    }
}
