using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Promociones.Commands.CrearPromocion;

public class CrearPromocionCommandHandler(IPromocionRepository promocionRepository) : IRequestHandler<CrearPromocionCommand, int>
{
    public async Task<int> Handle(CrearPromocionCommand request, CancellationToken cancellationToken)
    {
        await PromocionServicioUnico.ValidarAsync(promocionRepository, request.ServicioIds, promocionIdActual: null);

        return await promocionRepository.CreateAsync(new Promocion
        {
            Texto = request.Texto,
            NombreArchivo = request.NombreArchivo,
            TipoContenido = request.TipoContenido,
            RutaAlmacenamiento = request.RutaAlmacenamiento,
            ServicioIds = request.ServicioIds
        });
    }
}
