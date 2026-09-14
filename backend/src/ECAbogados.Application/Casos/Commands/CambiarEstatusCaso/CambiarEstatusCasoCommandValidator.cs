using ECAbogados.Domain.Entities;
using FluentValidation;

namespace ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;

public class CambiarEstatusCasoCommandValidator : AbstractValidator<CambiarEstatusCasoCommand>
{
    public CambiarEstatusCasoCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Estatus).IsInEnum();
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(500)
            .When(x => x.Estatus == EstatusCaso.Cerrado)
            .WithMessage("Indica el motivo de cierre del expediente.");
    }
}
