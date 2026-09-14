using FluentValidation;

namespace ECAbogados.Application.Casos.Commands.CrearActualizacionCaso;

public class CrearActualizacionCasoCommandValidator : AbstractValidator<CrearActualizacionCasoCommand>
{
    public CrearActualizacionCasoCommandValidator()
    {
        RuleFor(x => x.CasoId).GreaterThan(0);
        RuleFor(x => x.Texto).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Visibilidad).IsInEnum();
    }
}
