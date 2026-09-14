using FluentValidation;

namespace ECAbogados.Application.TramitesSAT.Commands.CrearTramiteSAT;

public class CrearTramiteSATCommandValidator : AbstractValidator<CrearTramiteSATCommand>
{
    public CrearTramiteSATCommandValidator()
    {
        RuleFor(x => x.ClienteId).GreaterThan(0);
        RuleFor(x => x.CatalogoTramiteId).GreaterThan(0);
        RuleFor(x => x.Observaciones).MaximumLength(1000);
    }
}
