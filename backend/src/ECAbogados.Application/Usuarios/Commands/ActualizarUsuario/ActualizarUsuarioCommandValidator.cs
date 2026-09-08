using FluentValidation;

namespace ECAbogados.Application.Usuarios.Commands.ActualizarUsuario;

public class ActualizarUsuarioCommandValidator : AbstractValidator<ActualizarUsuarioCommand>
{
    public ActualizarUsuarioCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Rol).NotEmpty().Must(r => r is "Administrador" or "Asistente")
            .WithMessage("Rol debe ser 'Administrador' o 'Asistente'.");
        RuleFor(x => x.NuevaPassword).MinimumLength(8).When(x => !string.IsNullOrEmpty(x.NuevaPassword));
    }
}
