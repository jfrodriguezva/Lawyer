using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Configuracion.Queries.ObtenerFlags;

public class ObtenerFlagsQueryHandler(IConfiguracionRepository configuracionRepository) : IRequestHandler<ObtenerFlagsQuery, FlagsDto>
{
    public async Task<FlagsDto> Handle(ObtenerFlagsQuery request, CancellationToken cancellationToken)
    {
        var sat = await configuracionRepository.GetValorAsync("sat_habilitado");
        var comercializadora = await configuracionRepository.GetValorAsync("comercializadora_habilitada");

        return new FlagsDto(sat == "true", comercializadora == "true");
    }
}
