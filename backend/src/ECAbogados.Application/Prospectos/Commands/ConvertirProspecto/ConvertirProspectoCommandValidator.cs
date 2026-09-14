using FluentValidation;

namespace ECAbogados.Application.Prospectos.Commands.ConvertirProspecto;

public class ConvertirProspectoCommandValidator : AbstractValidator<ConvertirProspectoCommand>
{
    public ConvertirProspectoCommandValidator()
    {
        RuleFor(x => x.ProspectoId).GreaterThan(0);
        RuleFor(x => x.TipoCaso).NotEmpty().MaximumLength(100);
        RuleFor(x => x.NotasCaso).MaximumLength(4000);
        RuleFor(x => x.Password).MinimumLength(8).When(x => x.Password is not null);
    }
}
