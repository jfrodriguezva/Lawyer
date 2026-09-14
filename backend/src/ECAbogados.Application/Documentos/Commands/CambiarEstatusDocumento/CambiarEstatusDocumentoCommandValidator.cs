using FluentValidation;

namespace ECAbogados.Application.Documentos.Commands.CambiarEstatusDocumento;

public class CambiarEstatusDocumentoCommandValidator : AbstractValidator<CambiarEstatusDocumentoCommand>
{
    public CambiarEstatusDocumentoCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Estatus).IsInEnum();
        RuleFor(x => x.ComentarioRevision).MaximumLength(1000);
    }
}
