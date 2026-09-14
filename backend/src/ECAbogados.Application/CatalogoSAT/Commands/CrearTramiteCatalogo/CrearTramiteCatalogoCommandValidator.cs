using FluentValidation;

namespace ECAbogados.Application.CatalogoSAT.Commands.CrearTramiteCatalogo;

public class CrearTramiteCatalogoCommandValidator : AbstractValidator<CrearTramiteCatalogoCommand>
{
    public CrearTramiteCatalogoCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Requisitos).MaximumLength(4000);
        RuleFor(x => x.Etapas).MaximumLength(4000);
        RuleFor(x => x.Observaciones).MaximumLength(1000);
    }
}
