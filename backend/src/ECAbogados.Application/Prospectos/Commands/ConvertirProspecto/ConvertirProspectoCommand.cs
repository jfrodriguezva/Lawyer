using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Prospectos.Commands.ConvertirProspecto;

/// <summary>
/// Concreta la contratación: crea la cuenta de Cliente (por invitación segura si
/// Password es null, o directa si el Abogado captura una contraseña) y abre el
/// primer Caso para ese cliente, sin volver a pedir los datos ya capturados.
/// </summary>
public record ConvertirProspectoCommand(
    int ProspectoId,
    string TipoCaso,
    string? NotasCaso,
    int? AbogadoResponsableId,
    string? Prioridad,
    string? Password) : IRequest<ConvertirProspectoResult>;

public record ConvertirProspectoResult(int ClienteId, int CasoId);
