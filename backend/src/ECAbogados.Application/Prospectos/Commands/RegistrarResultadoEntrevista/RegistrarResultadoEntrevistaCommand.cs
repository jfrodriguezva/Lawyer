using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Prospectos.Commands.RegistrarResultadoEntrevista;

public record RegistrarResultadoEntrevistaCommand(
    int ProspectoId,
    string ResultadoEntrevista,
    EstatusConflictoInteres ConflictoInteres,
    string? MotivoNoContratacion) : IRequest;
