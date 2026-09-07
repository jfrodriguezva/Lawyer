using FluentValidation;

namespace ECAbogados.Application.Casos.Commands.ActualizarCaso;

public class ActualizarCasoCommandValidator : AbstractValidator<ActualizarCasoCommand>
{
    public ActualizarCasoCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.ClienteNombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Tipo).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Notas).MaximumLength(4000);
    }
}
