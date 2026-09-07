using FluentValidation;

namespace ECAbogados.Application.Plazos.Commands.CrearPlazo;

public class CrearPlazoCommandValidator : AbstractValidator<CrearPlazoCommand>
{
    public CrearPlazoCommandValidator()
    {
        RuleFor(x => x.CasoId).GreaterThan(0);
        RuleFor(x => x.Descripcion).NotEmpty().MaximumLength(300);
        RuleFor(x => x.FechaLimite).NotEmpty();
    }
}
