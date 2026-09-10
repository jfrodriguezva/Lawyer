using FluentValidation;

namespace ECAbogados.Application.Auth.Commands.RestablecerPassword;

public class RestablecerPasswordCommandValidator : AbstractValidator<RestablecerPasswordCommand>
{
    public RestablecerPasswordCommandValidator()
    {
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NuevaPassword).NotEmpty().MinimumLength(8);
    }
}
