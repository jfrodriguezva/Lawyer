using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Configuracion.Queries.ObtenerFlags;

// Pública a propósito: el sitio necesita saber si mostrar la opción de "Trámite
// SAT" en el formulario de citas antes de que exista sesión alguna.
public record ObtenerFlagsQuery : IRequest<FlagsDto>;

public record FlagsDto(bool SatHabilitado, bool ComercializadoraHabilitada);
