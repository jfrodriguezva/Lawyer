using FluentValidation;

namespace ECAbogados.Application.Promociones.Commands.CrearPromocion;

public class CrearPromocionCommandValidator : AbstractValidator<CrearPromocionCommand>
{
    public CrearPromocionCommandValidator()
    {
        RuleFor(x => x.Texto).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.NombreArchivo).NotEmpty().MaximumLength(300);
        RuleFor(x => x.TipoContenido).NotEmpty().MaximumLength(150);
        RuleFor(x => x.RutaAlmacenamiento).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ServicioIds).NotEmpty().WithMessage("Selecciona al menos un servicio.");
    }
}
