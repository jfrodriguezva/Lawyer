using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.VincularClienteACaso;

public record VincularClienteACasoCommand(int CasoId, int ClienteId) : IRequest;
