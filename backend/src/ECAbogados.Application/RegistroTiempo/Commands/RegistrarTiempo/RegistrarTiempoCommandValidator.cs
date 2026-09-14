using FluentValidation;

namespace ECAbogados.Application.RegistrosTiempo.Commands.RegistrarTiempo;

public class RegistrarTiempoCommandValidator : AbstractValidator<RegistrarTiempoCommand>
{
    public RegistrarTiempoCommandValidator()
    {
        RuleFor(x => x.CasoId).GreaterThan(0);
        RuleFor(x => x.Minutos).GreaterThan(0).LessThanOrEqualTo(24 * 60);
        RuleFor(x => x.Descripcion).MaximumLength(300);
    }
}
