using FluentValidation;

namespace ECAbogados.Application.Citas.Commands.CambiarEstatusCita;

public class CambiarEstatusCitaCommandValidator : AbstractValidator<CambiarEstatusCitaCommand>
{
    public CambiarEstatusCitaCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Estatus).IsInEnum();
    }
}
