using FluentValidation;

namespace ECAbogados.Application.Clientes.Commands.InvitarCliente;

public class InvitarClienteCommandValidator : AbstractValidator<InvitarClienteCommand>
{
    public InvitarClienteCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}
