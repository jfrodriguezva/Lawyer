using FluentValidation;

namespace ECAbogados.Application.Documentos.Commands.SubirDocumento;

public class SubirDocumentoCommandValidator : AbstractValidator<SubirDocumentoCommand>
{
    public SubirDocumentoCommandValidator()
    {
        RuleFor(x => x.CasoId).GreaterThan(0);
        RuleFor(x => x.NombreArchivo).NotEmpty().MaximumLength(300);
        RuleFor(x => x.TipoContenido).NotEmpty().MaximumLength(150);
        RuleFor(x => x.TamanoBytes).GreaterThan(0);
        RuleFor(x => x.RutaAlmacenamiento).NotEmpty().MaximumLength(500);
    }
}
