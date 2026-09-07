using FluentValidation;

namespace ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;

public class CambiarEstatusCasoCommandValidator : AbstractValidator<CambiarEstatusCasoCommand>
{
    public CambiarEstatusCasoCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Estatus).IsInEnum();
    }
}
