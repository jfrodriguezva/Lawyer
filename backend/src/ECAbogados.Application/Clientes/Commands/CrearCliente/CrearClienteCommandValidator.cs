using FluentValidation;

namespace ECAbogados.Application.Clientes.Commands.CrearCliente;

public class CrearClienteCommandValidator : AbstractValidator<CrearClienteCommand>
{
    public CrearClienteCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}
