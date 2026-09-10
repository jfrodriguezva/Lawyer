using FluentValidation;

namespace ECAbogados.Application.Auth.Commands.SolicitarResetPassword;

public class SolicitarResetPasswordCommandValidator : AbstractValidator<SolicitarResetPasswordCommand>
{
    public SolicitarResetPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
