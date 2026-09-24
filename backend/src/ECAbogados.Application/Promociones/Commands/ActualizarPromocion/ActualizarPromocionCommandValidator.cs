using FluentValidation;

namespace ECAbogados.Application.Promociones.Commands.ActualizarPromocion;

public class ActualizarPromocionCommandValidator : AbstractValidator<ActualizarPromocionCommand>
{
    public ActualizarPromocionCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Texto).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.ServicioIds).NotEmpty().WithMessage("Selecciona al menos un servicio.");
    }
}
