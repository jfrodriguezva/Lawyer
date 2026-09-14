using FluentValidation;

namespace ECAbogados.Application.Auth.Commands.AceptarInvitacionCliente;

public class AceptarInvitacionClienteCommandValidator : AbstractValidator<AceptarInvitacionClienteCommand>
{
    public AceptarInvitacionClienteCommandValidator()
    {
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NuevaPassword).NotEmpty().MinimumLength(8);
    }
}
