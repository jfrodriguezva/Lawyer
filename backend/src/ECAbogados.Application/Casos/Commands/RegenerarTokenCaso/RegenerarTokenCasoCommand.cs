using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.RegenerarTokenCaso;

public record RegenerarTokenCasoCommand(int CasoId) : IRequest<string>;
