using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.RegenerarTokenCaso;

public class RegenerarTokenCasoCommandHandler(ICasoRepository casoRepository)
    : IRequestHandler<RegenerarTokenCasoCommand, string>
{
    public async Task<string> Handle(RegenerarTokenCasoCommand request, CancellationToken cancellationToken)
    {
        return await casoRepository.RegenerarTokenAsync(request.CasoId);
    }
}
