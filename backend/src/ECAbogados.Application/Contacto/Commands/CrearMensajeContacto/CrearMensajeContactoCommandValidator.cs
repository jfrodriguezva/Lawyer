using FluentValidation;

namespace ECAbogados.Application.Contacto.Commands.CrearMensajeContacto;

public class CrearMensajeContactoCommandValidator : AbstractValidator<CrearMensajeContactoCommand>
{
    public CrearMensajeContactoCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Telefono).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Mensaje).NotEmpty().MaximumLength(2000);
    }
}
