using FluentValidation;

namespace ECAbogados.Application.Prospectos.Commands.RegistrarResultadoEntrevista;

public class RegistrarResultadoEntrevistaCommandValidator : AbstractValidator<RegistrarResultadoEntrevistaCommand>
{
    public RegistrarResultadoEntrevistaCommandValidator()
    {
        RuleFor(x => x.ProspectoId).GreaterThan(0);
        RuleFor(x => x.ResultadoEntrevista).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.ConflictoInteres).IsInEnum();
        RuleFor(x => x.MotivoNoContratacion).MaximumLength(500);
    }
}
