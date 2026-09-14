using FluentValidation;

namespace ECAbogados.Application.Usuarios.Commands.ActualizarMiPerfil;

public class ActualizarMiPerfilCommandValidator : AbstractValidator<ActualizarMiPerfilCommand>
{
    public ActualizarMiPerfilCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PasswordActual).NotEmpty()
            .When(x => !string.IsNullOrEmpty(x.NuevaPassword))
            .WithMessage("Debes indicar tu contraseña actual para cambiarla.");
        RuleFor(x => x.NuevaPassword).MinimumLength(8).When(x => !string.IsNullOrEmpty(x.NuevaPassword));
    }
}
