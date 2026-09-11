using FluentValidation;

namespace ECAbogados.Application.Auth.Commands.LoginCliente;

public class LoginClienteCommandValidator : AbstractValidator<LoginClienteCommand>
{
    public LoginClienteCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}
