using FluentValidation;

namespace ECAbogados.Application.CatalogoSAT.Commands.ActualizarTramiteCatalogo;

public class ActualizarTramiteCatalogoCommandValidator : AbstractValidator<ActualizarTramiteCatalogoCommand>
{
    public ActualizarTramiteCatalogoCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Requisitos).MaximumLength(4000);
        RuleFor(x => x.Etapas).MaximumLength(4000);
        RuleFor(x => x.Observaciones).MaximumLength(1000);
    }
}
