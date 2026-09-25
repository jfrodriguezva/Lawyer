using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Application.Promociones.Queries.ListarPromocionesActivas;

namespace ECAbogados.Application.Catalogo.Queries.ListarCatalogoPublico;

public class ListarCatalogoPublicoQueryHandler(
    IModuloRepository moduloRepository,
    IServicioRepository servicioRepository,
    IPromocionRepository promocionRepository) : IRequestHandler<ListarCatalogoPublicoQuery, CatalogoPublicoDto>
{
    // Las tres consultas son independientes entre sí (conexiones propias, ver
    // SqlConnectionFactory) -- se disparan en paralelo en vez de una tras otra.
    public async Task<CatalogoPublicoDto> Handle(ListarCatalogoPublicoQuery request, CancellationToken cancellationToken)
    {
        var modulosTask = moduloRepository.GetAllAsync();
        var serviciosTask = servicioRepository.GetActivosAsync();
        var promocionesTask = promocionRepository.GetActivasAsync();
        await Task.WhenAll(modulosTask, serviciosTask, promocionesTask);

        var promociones = promocionesTask.Result
            .Select(p => new PromocionPublicaDto(p.Id, p.Texto, p.ServicioIds))
            .ToList();

        return new CatalogoPublicoDto(modulosTask.Result, serviciosTask.Result, promociones);
    }
}
