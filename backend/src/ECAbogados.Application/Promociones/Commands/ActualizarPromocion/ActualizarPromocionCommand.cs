using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Commands.ActualizarPromocion;

// NombreArchivo/TipoContenido/RutaAlmacenamiento nulos = conservar la imagen actual
// (el admin no subió un archivo nuevo al editar).
public record ActualizarPromocionCommand(
    int Id,
    string Texto,
    string? NombreArchivo,
    string? TipoContenido,
    string? RutaAlmacenamiento,
    List<int> ServicioIds) : IRequest;
