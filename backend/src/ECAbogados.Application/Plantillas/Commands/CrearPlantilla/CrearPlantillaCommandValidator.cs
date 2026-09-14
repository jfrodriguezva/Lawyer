using FluentValidation;

namespace ECAbogados.Application.Plantillas.Commands.CrearPlantilla;

public class CrearPlantillaCommandValidator : AbstractValidator<CrearPlantillaCommand>
{
    public CrearPlantillaCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Contenido).NotEmpty().MaximumLength(2000);
    }
}
