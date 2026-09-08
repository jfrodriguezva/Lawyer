using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.RegenerarTokenCaso;

public class RegenerarTokenCasoCommandHandler(
    ICasoRepository casoRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<RegenerarTokenCasoCommand, string>
{
    public async Task<string> Handle(RegenerarTokenCasoCommand request, CancellationToken cancellationToken)
    {
        var token = await casoRepository.RegenerarTokenAsync(request.CasoId);

        await auditoriaRepository.RegistrarAsync(currentUser, "Caso", request.CasoId, "Regeneró el enlace del portal");

        return token;
    }
}
