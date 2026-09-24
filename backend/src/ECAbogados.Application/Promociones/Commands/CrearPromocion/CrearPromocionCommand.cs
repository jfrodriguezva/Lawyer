using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Commands.CrearPromocion;

public record CrearPromocionCommand(
    string Texto,
    string NombreArchivo,
    string TipoContenido,
    string RutaAlmacenamiento,
    List<int> ServicioIds) : IRequest<int>;
