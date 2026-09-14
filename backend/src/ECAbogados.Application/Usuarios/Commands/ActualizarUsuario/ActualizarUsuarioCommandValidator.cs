using ECAbogados.Domain.Entities;
using FluentValidation;

namespace ECAbogados.Application.Usuarios.Commands.ActualizarUsuario;

public class ActualizarUsuarioCommandValidator : AbstractValidator<ActualizarUsuarioCommand>
{
    public ActualizarUsuarioCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Rol).NotEmpty().Must(r => Roles.Validos.Contains(r))
            .WithMessage($"Rol debe ser uno de: {string.Join(", ", Roles.Validos)}.");
        RuleFor(x => x.NuevaPassword).MinimumLength(8).When(x => !string.IsNullOrEmpty(x.NuevaPassword));
    }
}
