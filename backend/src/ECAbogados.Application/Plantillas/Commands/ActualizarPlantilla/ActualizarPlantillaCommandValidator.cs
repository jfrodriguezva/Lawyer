using FluentValidation;

namespace ECAbogados.Application.Plantillas.Commands.ActualizarPlantilla;

public class ActualizarPlantillaCommandValidator : AbstractValidator<ActualizarPlantillaCommand>
{
    public ActualizarPlantillaCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Contenido).NotEmpty().MaximumLength(2000);
    }
}
