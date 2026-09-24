using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Promociones.Commands.ActualizarPromocion;

public class ActualizarPromocionCommandHandler(IPromocionRepository promocionRepository) : IRequestHandler<ActualizarPromocionCommand>
{
    public async Task Handle(ActualizarPromocionCommand request, CancellationToken cancellationToken)
    {
        var promocion = await promocionRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró la promoción con Id {request.Id}");

        await PromocionServicioUnico.ValidarAsync(promocionRepository, request.ServicioIds, promocionIdActual: request.Id);

        promocion.Texto = request.Texto;
        if (request.RutaAlmacenamiento is not null)
        {
            promocion.NombreArchivo = request.NombreArchivo!;
            promocion.TipoContenido = request.TipoContenido!;
            promocion.RutaAlmacenamiento = request.RutaAlmacenamiento;
        }
        promocion.ServicioIds = request.ServicioIds;

        await promocionRepository.UpdateAsync(promocion);
    }
}
