using FluentValidation;

namespace ECAbogados.Application.Casos.Commands.CrearCaso;

public class CrearCasoCommandValidator : AbstractValidator<CrearCasoCommand>
{
    public CrearCasoCommandValidator()
    {
        RuleFor(x => x.ClienteNombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Tipo).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Notas).MaximumLength(4000);
    }
}
