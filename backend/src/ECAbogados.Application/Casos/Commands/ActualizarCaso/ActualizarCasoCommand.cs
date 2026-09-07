using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.ActualizarCaso;

public record ActualizarCasoCommand(
    int Id,
    string ClienteNombre,
    string Tipo,
    string? Notas) : IRequest;
