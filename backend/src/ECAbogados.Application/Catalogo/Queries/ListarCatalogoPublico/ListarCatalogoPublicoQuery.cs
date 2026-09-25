using ECAbogados.Application.Mediation;
using ECAbogados.Application.Promociones.Queries.ListarPromocionesActivas;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Catalogo.Queries.ListarCatalogoPublico;

// Une los tres GET públicos que el sitio pedía por separado (Módulos/Servicios/
// Promociones "activos"): GuestHeader y LandingExperience los piden cada uno por
// su cuenta en cada carga de la home, así que un solo viaje de red en vez de tres
// reduce tanto la carga a la BD como el riesgo de volver a topar el rate limit
// (ver Program.cs, política "catalogo-publico").
public record CatalogoPublicoDto(
    IReadOnlyList<Modulo> Modulos,
    IReadOnlyList<Servicio> Servicios,
    IReadOnlyList<PromocionPublicaDto> Promociones);

public record ListarCatalogoPublicoQuery : IRequest<CatalogoPublicoDto>;
