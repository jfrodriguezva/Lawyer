using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Interfaces;

namespace ECAbogados.Application.Promociones;

/// <summary>
/// Un Servicio solo puede tener una Promoción (activa o inactiva) a la vez --
/// evita que dos promociones distintas queden asociadas al mismo servicio. Se
/// valida aquí (no con una restricción de BD) porque depende de leer todas las
/// promociones existentes, no de una columna simple.
/// </summary>
public static class PromocionServicioUnico
{
    public static async Task ValidarAsync(IPromocionRepository promocionRepository, IReadOnlyList<int> servicioIds, int? promocionIdActual)
    {
        var todas = await promocionRepository.GetAllAsync();

        foreach (var promocion in todas)
        {
            if (promocion.Id == promocionIdActual)
            {
                continue;
            }

            var enConflicto = promocion.ServicioIds.Intersect(servicioIds).Any();
            if (enConflicto)
            {
                throw new ConflictException(
                    $"Uno de los servicios seleccionados ya tiene una promoción (Id {promocion.Id}). Elimínala o quita ese servicio de esta promoción antes de continuar.");
            }
        }
    }
}
