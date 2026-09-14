using ECAbogados.Domain.Entities;
using FluentValidation;

namespace ECAbogados.Application.Usuarios.Commands.CrearUsuario;

public class CrearUsuarioCommandValidator : AbstractValidator<CrearUsuarioCommand>
{
    public CrearUsuarioCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Rol).NotEmpty().Must(r => Roles.Validos.Contains(r))
            .WithMessage($"Rol debe ser uno de: {string.Join(", ", Roles.Validos)}.");
    }
}
