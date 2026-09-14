using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Prospectos.Commands.RegistrarResultadoEntrevista;

public class RegistrarResultadoEntrevistaCommandHandler(
    IProspectoRepository prospectoRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<RegistrarResultadoEntrevistaCommand>
{
    public async Task Handle(RegistrarResultadoEntrevistaCommand request, CancellationToken cancellationToken)
    {
        var prospecto = await prospectoRepository.GetByIdAsync(request.ProspectoId)
            ?? throw new KeyNotFoundException($"No se encontró el prospecto con Id {request.ProspectoId}");

        prospecto.ResultadoEntrevista = request.ResultadoEntrevista;
        prospecto.ConflictoInteres = request.ConflictoInteres;
        prospecto.MotivoNoContratacion = request.MotivoNoContratacion;
        prospecto.Etapa = string.IsNullOrWhiteSpace(request.MotivoNoContratacion)
            ? EtapaProspecto.EntrevistaRealizada
            : EtapaProspecto.NoContratado;

        await prospectoRepository.UpdateAsync(prospecto);

        await auditoriaRepository.RegistrarAsync(currentUser, "Prospecto", prospecto.Id, "Registró el resultado de la entrevista");
    }
}
