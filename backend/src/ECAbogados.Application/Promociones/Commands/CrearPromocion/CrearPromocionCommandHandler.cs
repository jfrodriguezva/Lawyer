using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Promociones.Commands.CrearPromocion;

public class CrearPromocionCommandHandler(IPromocionRepository promocionRepository) : IRequestHandler<CrearPromocionCommand, int>
{
    public Task<int> Handle(CrearPromocionCommand request, CancellationToken cancellationToken) =>
        promocionRepository.CreateAsync(new Promocion
        {
            Texto = request.Texto,
            NombreArchivo = request.NombreArchivo,
            TipoContenido = request.TipoContenido,
            RutaAlmacenamiento = request.RutaAlmacenamiento,
            ServicioIds = request.ServicioIds
        });
}
